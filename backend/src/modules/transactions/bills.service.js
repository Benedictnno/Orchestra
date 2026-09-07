import { randomUUID } from 'crypto'
import BillPayment from './models/BillPayment.model.js'
import * as transactionsService from './transactions.service.js'
import { cardsService } from '../cards/index.js'
import { nairaToKobo } from '../../shared/utils/formatters.js'
import { withTransaction } from '../../shared/database/transaction.js'

/**
 * Perform a bill payment using a source card.
 */
export async function createBillPayment(userId, { amount, sourceCardId, billerCode, billerName, customerId, narration }) {
  const amountKobo = nairaToKobo(amount)

  return withTransaction(async (session) => {
    // 1. Check card balance & deduct via cards service
    const sourceCard = await cardsService.verifyAndDeductBalance(userId, sourceCardId, amountKobo, session)
    const reference = randomUUID()

    // 2. Create the unified Transaction record (type: bill_payment)
    const tx = await transactionsService.recordTransaction({
      userId,
      cardId: sourceCard._id,
      pan: sourceCard.pan,
      amount: amountKobo,
      type: 'bill_payment',
      category: 'bills',
      merchant: billerCode,
      narration: narration || `Bill Payment: ${billerName || billerCode}`,
      reference,
    }, session)

    // 3. Create the detailed BillPayment record
    const [payment] = await BillPayment.create([{
      userId,
      sourceCardId: sourceCard._id,
      sourcePan: sourceCard.pan,
      amount: amountKobo,
      billerCode,
      billerName,
      customerId,
      narration,
      reference,
      transactionId: tx._id,
      status: 'success',
    }], session ? { session } : {})

    return payment
  })
}

/**
 * Fetch all bill payments for a user.
 */
export async function getBillPayments(userId) {
  return BillPayment.find({ userId }).sort({ createdAt: -1 }).lean()
}
