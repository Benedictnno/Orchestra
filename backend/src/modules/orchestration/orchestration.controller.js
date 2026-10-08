import * as orchestrationService from './orchestration.service.js'

export async function getOrchestraCard(req, res) {
  const card = await orchestrationService.getOrchestraCard(req.user._id)
  res.json({ card })
}

export async function getFundingSources(req, res) {
  const sources = await orchestrationService.getFundingSources(req.user._id)
  res.json({ sources, selectedFundingSourceId: sources.find(s => s.isSelected)?._id || null })
}

export async function selectFundingSource(req, res) {
  const result = await orchestrationService.selectFundingSource(req.user._id, req.body.fundingSourceId)
  res.json({ card: result })
}

export async function routePayment(req, res) {
  const result = await orchestrationService.routePayment(req.user._id, req.body)
  res.json(result)
}
