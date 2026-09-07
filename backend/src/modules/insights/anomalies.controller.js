import { transactionsService } from '../transactions/index.js'
import * as anomalyService from './services/anomaly.service.js'

export async function getAnomalies(req, res) {
  const anomalies = await transactionsService.getAnomalyTransactions(req.user._id, 50)
  res.json({ anomalies })
}

export async function scanAnomalies(req, res) {
  const flaggedCount = await anomalyService.scanUserAnomalies(req.user._id)
  res.json({ message: 'Anomaly scan complete', flaggedCount })
}
