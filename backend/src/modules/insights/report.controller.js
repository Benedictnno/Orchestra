import * as insightsService from './insights.service.js'

export async function getReport(req, res) {
  const days = parseInt(req.query.days ?? '30', 10)
  const result = await insightsService.generateReport(req.user._id, req.user.name, days)
  res.json(result)
}
