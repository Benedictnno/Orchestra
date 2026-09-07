import * as businessService from './business.service.js'

export async function getBusinessCards(req, res) {
  const cards = await businessService.getBusinessCards(req.user._id)
  res.json({ cards })
}

export async function getApprovalQueue(req, res) {
  const approvalQueue = await businessService.getApprovalQueue(req.user._id)
  res.json({ approvalQueue })
}

export async function createBusinessCard(req, res) {
  const businessCard = await businessService.createBusinessCard(req.user._id, req.body)
  res.status(201).json({ businessCard })
}

export async function updateBusinessCard(req, res) {
  const card = await businessService.updateBusinessCard(req.user._id, req.params.id, req.body)
  res.json({ card })
}

export async function handleApproval(req, res) {
  const request = await businessService.handleApproval(req.user._id, req.body)
  res.json({ request })
}
