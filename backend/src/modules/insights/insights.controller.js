import * as insightsService from './insights.service.js'

export async function getInsights(req, res) {
  const result = await insightsService.getInsights(req.user._id)
  res.json(result)
}

export async function getSavings(req, res) {
  const result = await insightsService.getSavings(req.user._id, req.body.adjustments)
  res.json(result)
}
