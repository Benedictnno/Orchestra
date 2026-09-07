import * as cardsService from './cards.service.js'

export async function getCards(req, res) {
  const cards = await cardsService.getUserCards(req.user._id)
  res.json({ cards })
}

export async function addCard(req, res) {
  const card = await cardsService.addCard(req.user._id, req.body)
  res.status(201).json({ card })
}

export async function getCard(req, res) {
  const card = await cardsService.getCardById(req.user._id, req.params.id)
  res.json({ card })
}

export async function updateCard(req, res) {
  const result = await cardsService.updateCard(req.user._id, req.params.id, req.body)
  res.json(result)
}

export async function deleteCard(req, res) {
  const result = await cardsService.deleteCard(req.user._id, req.params.id)
  res.json(result)
}

export async function getCardBalance(req, res) {
  const result = await cardsService.getCardBalance(req.user._id, req.params.id)
  res.json(result)
}
