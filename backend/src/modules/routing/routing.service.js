import { randomUUID } from 'crypto'
import RoutingRule from './models/RoutingRule.model.js'
import { cardsService } from '../cards/index.js'
import { BadRequestError } from '../../shared/errors/httpErrors.js'

/**
 * Get routing rule for a user.
 */
export async function getRoutingRule(userId) {
  return RoutingRule.findOne({ userId }).populate('primaryCardId cardOrder')
}

/**
 * Update/upsert routing rule for a user.
 */
export async function updateRoutingRule(userId, { mode, primaryCardId, cardOrder }) {
  return RoutingRule.findOneAndUpdate(
    { userId },
    { mode, primaryCardId, cardOrder },
    { upsert: true, new: true, runValidators: true }
  )
}

/**
 * Calculate multi-card payment allocations against available balances.
 */
export async function resolvePayment(userId, amountKobo) {
  const rule = await RoutingRule.findOne({ userId }).populate('primaryCardId cardOrder')
  const withBalances = await cardsService.getUserCardsWithBalances(userId, rule?.cardOrder || [])
  const mode = rule?.mode ?? 'auto-split'

  const totalAvailable = withBalances.reduce((s, c) => s + (c.available ?? 0), 0)
  if (totalAvailable < amountKobo) {
    return {
      success: false,
      reason: 'Insufficient funds across all cards',
      totalAvailable,
      requested: amountKobo
    }
  }

  let allocations = []

  if (mode === 'primary') {
    let remaining = amountKobo
    const primaryId = rule?.primaryCardId?._id ? rule.primaryCardId._id.toString() : null
    const ordered = primaryId
      ? [
          withBalances.find(c => c._id.toString() === primaryId),
          ...withBalances.filter(c => c._id.toString() !== primaryId),
        ].filter(Boolean)
      : withBalances

    for (const card of ordered) {
      if (remaining <= 0) break
      const charge = Math.min(card.available, remaining)
      if (charge > 0) {
        allocations.push({ card, charge, remaining: card.available - charge })
        remaining -= charge
      }
    }
  }

  if (mode === 'balanced') {
    const share = Math.ceil(amountKobo / withBalances.length)
    let remaining = amountKobo
    for (const card of withBalances) {
      if (remaining <= 0) break
      const charge = Math.min(card.available, share, remaining)
      allocations.push({ card, charge, remaining: card.available - charge })
      remaining -= charge
    }
  }

  if (mode === 'auto-split') {
    let remaining = amountKobo
    for (const card of withBalances) {
      if (remaining <= 0) break
      const charge = Math.min(card.available, remaining)
      if (charge > 0) {
        allocations.push({ card, charge, remaining: card.available - charge })
        remaining -= charge
      }
    }
  }

  return { success: true, mode, allocations, totalCharged: amountKobo }
}

/**
 * Simulate payment routing with optional anomaly check and transaction persistence.
 */
export async function simulatePayment(userId, { amount, merchant, category, save }, { detectAnomalies, recordTransaction } = {}) {
  const result = await resolvePayment(userId, amount)
  if (!result.success) {
    throw new BadRequestError(result.reason || 'Payment resolution failed', result)
  }

  let anomaly = null
  if (typeof detectAnomalies === 'function') {
    anomaly = await detectAnomalies(userId, amount, merchant, category)
  }

  if (save && typeof recordTransaction === 'function') {
    await recordTransaction({
      userId,
      amount,
      currency: 'NGN',
      category: category || 'other',
      merchant,
      narration: `Simulated: ${merchant}`,
      reference: randomUUID(),
      transactionDate: new Date(),
      simulatedSplit: result.allocations.map(a => ({
        cardId: a.card._id,
        amount: a.charge,
      }))
    })
  }

  return {
    ...result,
    merchant,
    category,
    anomaly,
    steps: result.allocations.map((a, i) => ({
      step:        i + 1,
      cardLabel:   a.card.label,
      bank:        a.card.bank,
      cardProgram: a.card.cardProgram,
      charged:     a.charge,
      remaining:   a.remaining,
    }))
  }
}
