import { randomUUID } from 'crypto'
import Transfer from './models/Transfer.model.js'
import TransferPool from './models/TransferPool.model.js'
import * as transactionsService from './transactions.service.js'
import { cardsService } from '../cards/index.js'
import { nairaToKobo, maskPan } from '../../shared/utils/formatters.js'
import { withTransaction } from '../../shared/database/transaction.js'
import { calculateAllocation, ALLOCATION_STATUS } from './allocation.engine.js'
import { BadRequestError, NotFoundError } from '../../shared/errors/httpErrors.js'

/**
 * Normalize single-source (legacy) and multi-source inputs into one ordered,
 * de-duplicated list of card ids. Order is preserved so allocation stays
 * deterministic (sequential waterfall in the user's selection order).
 */
function normalizeSourceIds({ sourceCardId, sourceCardIds } = {}) {
  const ids = Array.isArray(sourceCardIds) && sourceCardIds.length
    ? sourceCardIds
    : (sourceCardId ? [sourceCardId] : [])
  return ids.map(String)
}

/**
 * Load the selected cards with their live balances, verifying ownership and
 * active status. Read-only — never mutates balances.
 */
async function resolveFundingSources(userId, sourceIds) {
  const seen = new Set()
  for (const id of sourceIds) {
    if (seen.has(id)) throw new BadRequestError('Duplicate funding source selected')
    seen.add(id)
  }

  const cards = await cardsService.getUserCards(userId)
  const byId = new Map(cards.map((c) => [String(c._id), c]))

  return sourceIds.map((id) => {
    const card = byId.get(id)
    if (!card) throw new NotFoundError('Funding source not found or does not belong to you')
    if (card.cardStatus !== '1') {
      throw new BadRequestError(`Funding source "${card.label || card.bank || id}" is not active`)
    }
    return {
      accountId: id,
      card,
      availableBalance: Math.max(0, Math.floor(card.availableBalance || 0)),
    }
  })
}

/** Attach presentational card metadata to a raw allocation result. */
function buildAllocationView(sources, result) {
  return {
    status: result.status,
    requestedAmount: result.requestedAmount,
    totalAvailable: result.totalAvailable,
    totalAllocated: result.totalAllocated,
    shortfall: result.shortfall,
    currency: 'NGN',
    allocations: result.allocations.map((a, i) => {
      const card = sources[i]?.card
      return {
        accountId: a.accountId,
        label: card?.label || card?.bank || 'Account',
        bank: card?.bank || null,
        maskedPan: maskPan(card?.pan),
        color: card?.color || null,
        amountRequested: a.amountRequested,
        amountAllocated: a.amountAllocated,
        balanceBefore: a.balanceBefore,
        balanceAfter: a.balanceAfter,
      }
    }),
  }
}

/**
 * Read-only allocation preview. Calculates how a requested amount would be drawn
 * from the selected sources WITHOUT mutating any balance.
 */
export async function previewTransfer(userId, { amount, sourceCardId, sourceCardIds }) {
  const amountKobo = nairaToKobo(amount)
  const sourceIds = normalizeSourceIds({ sourceCardId, sourceCardIds })
  if (!sourceIds.length) throw new BadRequestError('Select at least one funding source')

  const sources = await resolveFundingSources(userId, sourceIds)
  const result = calculateAllocation(
    sources.map((s) => ({ accountId: s.accountId, availableBalance: s.availableBalance })),
    amountKobo
  )

  return buildAllocationView(sources, result)
}

/**
 * Execute a (possibly multi-source) bank transfer.
 *
 * For multiple funding sources the money is collected through an internal,
 * temporary TransferPool and a single outgoing transfer is created for the
 * recipient. Balances are re-fetched and the allocation recalculated server-side
 * — the client allocation is never trusted.
 */
export async function createTransfer(userId, {
  amount,
  sourceCardId,
  sourceCardIds,
  recipientBank,
  recipientAccount,
  recipientName,
  narration,
  category,
}) {
  const amountKobo = nairaToKobo(amount)
  const selectedCategory = category || 'transfer'
  const sourceIds = normalizeSourceIds({ sourceCardId, sourceCardIds })

  if (!sourceIds.length) throw new BadRequestError('Select at least one funding source')

  // 1. Re-fetch current balances and recalculate allocation (do not trust client).
  const sources = await resolveFundingSources(userId, sourceIds)
  const allocation = calculateAllocation(
    sources.map((s) => ({ accountId: s.accountId, availableBalance: s.availableBalance })),
    amountKobo
  )

  // 2. Fail before any mutation when the transfer cannot be funded.
  if (allocation.status === ALLOCATION_STATUS.INVALID_AMOUNT) {
    throw new BadRequestError('Transfer amount must be greater than zero')
  }
  if (allocation.status === ALLOCATION_STATUS.INSUFFICIENT_FUNDS) {
    throw new BadRequestError('Insufficient funds across the selected funding sources', {
      status: allocation.status,
      requestedAmount: allocation.requestedAmount,
      totalAvailable: allocation.totalAvailable,
      shortfall: allocation.shortfall,
    })
  }

  const sourceById = new Map(sources.map((s) => [s.accountId, s]))
  const poolSources = allocation.allocations.map((a) => {
    const card = sourceById.get(a.accountId).card
    return {
      accountId: card._id,
      pan: card.pan,
      label: card.label,
      bank: card.bank,
      amountRequested: a.amountRequested,
      amountAllocated: a.amountAllocated,
      balanceBefore: a.balanceBefore,
      balanceAfter: a.balanceAfter,
    }
  })

  const contributing = poolSources.filter((s) => s.amountAllocated > 0)
  const isPooled = contributing.length > 1
  const primary = contributing[0] || poolSources[0]
  const reference = randomUUID()

  return withTransaction(async (session) => {
    const sessionOpt = session ? { session } : {}

    // 3. Create the internal funding pool (temporary — never a user-visible account).
    const [pool] = await TransferPool.create([{
      userId,
      requestedAmount: amountKobo,
      pooledAmount: 0,
      currency: 'NGN',
      status: 'COLLECTING',
      sources: poolSources,
      destination: {
        accountName: recipientName,
        accountNumber: recipientAccount,
        bankName: recipientBank,
      },
      reference,
    }], sessionOpt)

    const deducted = []
    try {
      // 4. Draw the allocated amount from each source account.
      for (const s of poolSources) {
        if (s.amountAllocated <= 0) continue
        await cardsService.deductBalanceByPan(s.pan, s.amountAllocated, session)
        deducted.push(s)
      }

      pool.pooledAmount = amountKobo
      pool.status = 'PROCESSING'
      await pool.save(sessionOpt)

      // 5. Record the unified ledger entry (renders as ONE outgoing transaction).
      const tx = await transactionsService.recordTransaction({
        userId,
        cardId: primary.accountId,
        pan: primary.pan,
        amount: amountKobo,
        type: 'transfer',
        category: selectedCategory,
        merchant: recipientBank,
        narration: narration || `Transfer to ${recipientName}`,
        reference,
        simulatedSplit: contributing.map((s) => ({ cardId: s.accountId, amount: s.amountAllocated })),
      }, session)

      // 6. Create the single outgoing transfer to the recipient.
      const [transfer] = await Transfer.create([{
        userId,
        sourceCardId: primary.accountId,
        sourcePan: primary.pan,
        amount: amountKobo,
        recipientBank,
        recipientAccount,
        recipientName,
        narration,
        category: selectedCategory,
        reference,
        transactionId: tx._id,
        status: 'success',
        isPooled,
        poolId: pool._id,
        fundingSources: poolSources.map((s) => ({
          cardId: s.accountId,
          label: s.label,
          bank: s.bank,
          pan: s.pan,
          amount: s.amountAllocated,
        })),
      }], sessionOpt)

      // 7. Mark the pool complete and link it to the transfer.
      pool.status = 'COMPLETED'
      pool.transferId = transfer._id
      await pool.save(sessionOpt)

      const transferObj = transfer.toObject ? transfer.toObject() : transfer
      return { ...transferObj, isPooled, poolId: pool._id, fundingSources: transfer.fundingSources }
    } catch (err) {
      // Service-level rollback for standalone MongoDB (no DB transaction support):
      // when running without a session, credit back the draws we already applied.
      if (!session) {
        await Promise.all(deducted.map((s) => cardsService.deductBalanceByPan(s.pan, -s.amountAllocated)))
      }
      throw err
    }
  })
}

/**
 * Fetch all transfers for a user.
 */
export async function getTransfers(userId) {
  return Transfer.find({ userId }).sort({ createdAt: -1 }).lean()
}
