import * as virtualCardsService from './virtualCards.service.js'

export async function getVirtualCards(req, res) {
  const cards = await virtualCardsService.getVirtualCards(req.user._id)
  res.json({ virtualCards: cards })
}

export async function createVirtualCard(req, res) {
  const vc = await virtualCardsService.createVirtualCard(req.user._id, req.body)
  res.status(201).json({ virtualCard: vc })
}

export async function updateVirtualCard(req, res) {
  const result = await virtualCardsService.updateVirtualCard(req.user._id, req.params.id, req.body)
  res.json(result)
}

export async function topUpVirtualCard(req, res) {
  const result = await virtualCardsService.topUpVirtualCard(req.user._id, req.params.id, req.body)
  res.json(result)
}
