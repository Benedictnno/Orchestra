import * as routingService from './routing.service.js'

export async function getRule(req, res) {
  const rule = await routingService.getRoutingRule(req.user._id)
  res.json({ rule })
}

export async function upsertRule(req, res) {
  const rule = await routingService.updateRoutingRule(req.user._id, req.body)
  res.json({ rule })
}

export async function simulate(req, res) {
  // Lazily resolve optional cross-service helpers if available
  let detectAnomalies = null
  let recordTransaction = null

  try {
    const { anomalyService } = await import('../insights/index.js')
    detectAnomalies = anomalyService.detectAnomalies
  } catch {
    // Insights module not yet loaded
  }

  try {
    const { transactionsService } = await import('../transactions/index.js')
    recordTransaction = transactionsService.recordTransaction
  } catch {
    // Transactions module not yet loaded
  }

  const result = await routingService.simulatePayment(
    req.user._id,
    req.body,
    { detectAnomalies, recordTransaction }
  )
  res.json(result)
}
