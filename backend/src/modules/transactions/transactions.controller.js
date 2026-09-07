import * as transactionsService from './transactions.service.js'

export async function getTransactions(req, res) {
  const result = await transactionsService.getTransactions(req.user._id, req.query)
  res.json(result)
}

export async function getTransaction(req, res) {
  const result = await transactionsService.getTransactionById(req.user._id, req.params.id)
  res.json({ transaction: result })
}

export async function createTransaction(req, res) {
  const result = await transactionsService.createTransaction(req.user._id, req.body)
  res.status(201).json({ transaction: result })
}

export async function getTransactionSummary(req, res) {
  const summary = await transactionsService.getSpendingSummary(req.user._id, 30)
  res.json({ summary })
}
