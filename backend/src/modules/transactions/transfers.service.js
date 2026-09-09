import { randomUUID } from 'crypto'
import Transfer from './models/Transfer.model.js'
import * as transactionsService from './transactions.service.js'
import { cardsService } from '../cards/index.js'
import { nairaToKobo } from '../../shared/utils/formatters.js'
import { withTransaction } from '../../shared/database/transaction.js'

/**
 * Perform a bank transfer using a source card.
 */
export async function createTransfer(userId, { amount, sourceCardId, recipientBank, recipientAccount, recipientName, narration, category }) {
  const amountKobo = nairaToKobo(amount)
  const selectedCategory = category || 'transfer'

  return withTransaction(async (session) => {
    // 1. Check card balance & deduct via cards service
    const sourceCard = await cardsService.verifyAndDeductBalance(userId, sourceCardId, amountKobo, session)
    const reference = randomUUID()

    // 2. Create the unified Transaction record (type: transfer)
    const tx = await transactionsService.recordTransaction({
      userId,
      cardId: sourceCard._id,
      pan: sourceCard.pan,
      amount: amountKobo,
      type: 'transfer',
      category: selectedCategory,
      merchant: recipientBank,
      narration: narration || `Transfer to ${recipientName}`,
      reference,
    }, session)

    // 3. Create the detailed Transfer record
    const [transfer] = await Transfer.create([{
      userId,
      sourceCardId: sourceCard._id,
      sourcePan: sourceCard.pan,
      amount: amountKobo,
      recipientBank,
      recipientAccount,
      recipientName,
      narration,
      category: selectedCategory,
      reference,
      transactionId: tx._id,
      status: 'success',
    }], session ? { session } : {})

    return transfer
  })
}

/**
 * Fetch all transfers for a user.
 */
export async function getTransfers(userId) {
  return Transfer.find({ userId }).sort({ createdAt: -1 }).lean()
}

