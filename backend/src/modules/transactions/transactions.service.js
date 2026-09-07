import { randomUUID } from 'crypto'
import Transaction from './models/Transaction.model.js'
import { cardsService } from '../cards/index.js'
import { routingService } from '../routing/index.js'
import { maskPan } from '../../shared/utils/formatters.js'
import { NotFoundError, BadRequestError } from '../../shared/errors/httpErrors.js'

/**
 * Query paginated transactions with flexible filtering.
 */
export async function getTransactions(userId, { cardId, category, from, to, limit = 50, page = 1 }) {
  const filter = { userId }

  if (cardId) filter.cardId = cardId
  if (category) filter.category = category
  if (from || to) {
    filter.transactionDate = {}
    if (from) filter.transactionDate.$gte = new Date(from)
    if (to) filter.transactionDate.$lte = new Date(to)
  }

  const skip = (Number(page) - 1) * Number(limit)
  const [transactions, total] = await Promise.all([
    Transaction.find(filter).sort({ transactionDate: -1 }).skip(skip).limit(Number(limit)),
    Transaction.countDocuments(filter),
  ])

  const masked = transactions.map(t => {
    const obj = t.toObject()
    return { ...obj, pan: maskPan(obj.pan) }
  })

  return { transactions: masked, total, page: Number(page), limit: Number(limit) }
}

/**
 * Get a specific transaction by ID.
 */
export async function getTransactionById(userId, transactionId) {
  const tx = await Transaction.findOne({ _id: transactionId, userId })
  if (!tx) throw new NotFoundError('Transaction not found')
  const txObj = tx.toObject()
  return { ...txObj, pan: maskPan(txObj.pan) }
}

/**
 * Create a new routed transaction.
 */
export async function createTransaction(userId, data) {
  const { amount, merchant, merchantCategory, category, narration, transactionDate, cardId } = data
  let resolvedPrimary
  let resolvedSplits

  // 1. Determine which card(s) should be charged
  if (cardId) {
    const card = await cardsService.getRawCardById(userId, cardId)
    resolvedPrimary = card
    resolvedSplits = [{ card, charge: amount }]
  } else {
    const routingResult = await routingService.resolvePayment(userId, amount)
    if (!routingResult.success) {
      throw new BadRequestError(routingResult.reason || 'Failed to route transaction')
    }
    resolvedPrimary = routingResult.allocations[0].card
    resolvedSplits = routingResult.allocations
  }

  // 2. Anomaly detection via insights anomaly service
  let isAnomaly = false
  let anomalyReason = undefined
  try {
    const { anomalyService } = await import('../insights/index.js')
    const anomaly = await anomalyService.detectAnomalies(userId, amount, merchant, category || 'other')
    isAnomaly = !!anomaly
    anomalyReason = anomaly ? anomaly.reasons.join(', ') : undefined
  } catch {
    // If anomaly service not yet available, skip
  }

  // 3. Save the transaction record
  const splitData = resolvedSplits.map(s => ({ cardId: s.card._id, amount: s.charge || s.amount }))
  
  const transaction = await Transaction.create({
    pan: resolvedPrimary.pan,
    cardId: resolvedPrimary._id,
    userId,
    amount,
    currency: 'NGN',
    merchant,
    merchantCategory,
    category,
    narration,
    transactionDate: transactionDate || new Date(),
    reference: randomUUID(),
    isAnomaly,
    anomalyReason,
    simulatedSplit: splitData,
  })

  // 4. Update balance cache to reflect deduction
  await Promise.all(resolvedSplits.map(s => {
    const chargeAmt = s.charge || s.amount
    return cardsService.deductBalanceByPan(s.card.pan, chargeAmt)
  }))

  const txObj = transaction.toObject()
  return { ...txObj, pan: maskPan(txObj.pan) }
}

/**
 * Record an immutable transaction (called by other services like transfers, bills, virtual-cards).
 */
export async function recordTransaction(txData) {
  return Transaction.create(txData)
}

/**
 * Compute spending statistics over N days.
 */
export async function getSpendingSummary(userId, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const txns  = await Transaction.find({ userId, transactionDate: { $gte: since } })

  const byCategory = txns.reduce((acc, t) => {
    const cat = t.category || 'other'
    acc[cat] = (acc[cat] || 0) + t.amount
    return acc
  }, {})

  const topMerchants = Object.entries(
    txns.reduce((acc, t) => {
      if (t.merchant) acc[t.merchant] = (acc[t.merchant] || 0) + t.amount
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const totalSpent        = txns.reduce((s, t) => s + t.amount, 0)
  const subscriptionSpend = byCategory['subscriptions'] || 0
  const anomalyCount      = txns.filter(t => t.isAnomaly).length

  // Calculate daily spending for charts
  const dailySpend = txns.reduce((acc, t) => {
    const date = t.transactionDate.toISOString().split('T')[0]
    acc[date] = (acc[date] || 0) + t.amount
    return acc
  }, {})

  return {
    byCategory, totalSpent, topMerchants, dailySpend,
    transactionCount: txns.length, subscriptionSpend, anomalyCount, days
  }
}

/**
 * Get recent transactions for LLM context or feeds.
 */
export async function getRecentTransactions(userId, limit = 15) {
  return Transaction.find({ userId })
    .sort({ transactionDate: -1 })
    .limit(limit)
    .lean()
}

/**
 * Fetch anomaly transactions.
 */
export async function getAnomalyTransactions(userId, limit = 50) {
  return Transaction.find({ userId, isAnomaly: true })
    .sort({ transactionDate: -1 })
    .limit(limit)
}

/**
 * Update transaction anomaly status.
 */
export async function flagTransactionAnomaly(transactionId, reason) {
  return Transaction.findByIdAndUpdate(
    transactionId,
    { isAnomaly: true, anomalyReason: reason },
    { new: true }
  )
}
