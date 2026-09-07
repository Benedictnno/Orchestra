import Card from './models/Card.model.js'
import CardBalance from './models/CardBalance.model.js'
import { card360 } from './providers/card360.provider.js'
import { maskPan } from '../../shared/utils/formatters.js'
import { NotFoundError, BadRequestError, ConflictError } from '../../shared/errors/httpErrors.js'

/**
 * Fetch all cards owned by a user with cached or live balances attached.
 */
export async function getUserCards(userId) {
  const cards = await Card.find({ userId }).lean()
  if (!cards.length) return []

  const pans = cards.map(c => c.pan)
  const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000)

  // Batch query cached balances within the 5-minute validity window
  const cachedBalances = await CardBalance.find({
    pan: { $in: pans },
    fetchedAt: { $gte: fiveMinsAgo }
  }).sort({ fetchedAt: -1 }).lean()

  const cachedMap = new Map()
  for (const cb of cachedBalances) {
    if (!cachedMap.has(cb.pan)) {
      cachedMap.set(cb.pan, cb)
    }
  }

  return Promise.all(cards.map(async (card) => {
    const cached = cachedMap.get(card.pan)

    const bal = cached ? {
      availableBalance: cached.availableBalance,
      ledgerBalance: cached.ledgerBalance,
      currency: cached.currency
    } : await card360.getBalance(card.pan, card.cardType).then(async (res) => {
      if (res.availableBalance !== undefined) {
        await CardBalance.findOneAndUpdate(
          { pan: card.pan },
          {
            cardId: card._id,
            availableBalance: res.availableBalance,
            ledgerBalance: res.ledgerBalance,
            currency: res.currency || 'NGN',
            responseCode: res.code || '00',
            responseDescription: res.description || 'Successful',
            fetchedAt: new Date()
          },
          { upsert: true }
        )
      }
      return res
    })

    const cardData = typeof card.toObject === 'function' ? card.toObject() : card
    return {
      ...cardData,
      pan:              maskPan(card.pan),
      availableBalance: bal.availableBalance ?? 0,
      ledgerBalance:    bal.ledgerBalance ?? 0,
      currency:         bal.currency ?? 'NGN',
    }
  }))
}

/**
 * Retrieve raw card documents with available balance for routing calculations.
 */
export async function getUserCardsWithBalances(userId, cardOrder = []) {
  const cards = cardOrder.length
    ? cardOrder
    : await Card.find({ userId, cardStatus: '1', cardType: { $ne: 'virtual' } })

  return Promise.all(cards.map(async (card) => {
    const bal = await card360.getBalance(card.pan, card.cardType)
    const cardData = typeof card.toObject === 'function' ? card.toObject() : card
    return { ...cardData, available: bal.availableBalance ?? 0 }
  }))
}

/**
 * Get a specific card by ID.
 */
export async function getCardById(userId, cardId) {
  const card = await Card.findOne({ _id: cardId, userId }).lean()
  if (!card) throw new NotFoundError('Card not found')
  return {
    ...card,
    pan: maskPan(card.pan),
  }
}

/**
 * Get raw Card model instance (internal to module or explicit contract helper).
 */
export async function getRawCardById(userId, cardId) {
  const card = await Card.findOne({ _id: cardId, userId })
  if (!card) throw new NotFoundError('Card not found')
  return card
}

/**
 * Get the user's default/primary card, or first card.
 */
export async function getPrimaryOrFirstCard(userId) {
  let card = await Card.findOne({ userId, isDefault: true })
  if (!card) {
    card = await Card.findOne({ userId, cardStatus: '1' })
  }
  return card
}

/**
 * Add a new bank card.
 */
export async function addCard(userId, cardData) {
  const { pan, expiryDate, label, bank, accountNumber, color, cardType } = cardData

  // Verify card exists on Card360 (or mock)
  const c360 = await card360.fetchCard({ 
    pan, 
    expiryDate, 
    issuerNr: '000001',
    cardSequenceNr: '01'
  })

  if (c360.code !== '00') {
    throw new BadRequestError('Card not found or invalid details')
  }

  const detail = c360.cardDetails[0]
  let card
  try {
    card = await Card.create({
      pan:         detail.pan,
      expiryDate:  detail.expiryDate,
      issuerNr:    detail.issuerNr,
      firstName:   detail.firstName,
      lastName:    detail.lastName,
      nameOnCard:  detail.nameOnCard,
      cardProgram: detail.cardProgram,
      customerId:  detail.customerId,
      cardStatus:  detail.cardStatus,
      seqNr:       detail.seqNr,
      userId,
      label,
      bank,
      accountNumber,
      color,
      cardType:    cardType || 'debit',
    })
  } catch (err) {
    if (err.code === 11000) {
      throw new ConflictError('Card with this PAN is already registered')
    }
    throw err
  }

  const cardObj = card.toObject()
  return { ...cardObj, pan: maskPan(cardObj.pan) }
}

/**
 * Update card settings or block/unblock status.
 */
export async function updateCard(userId, cardId, updateData) {
  const { action, ...otherUpdates } = updateData
  const card = await Card.findOne({ _id: cardId, userId })
  if (!card) throw new NotFoundError('Card not found')

  if (!action) {
    const updated = await Card.findOneAndUpdate(
      { _id: cardId, userId },
      otherUpdates,
      { new: true }
    )
    const updatedObj = updated.toObject()
    return { card: { ...updatedObj, pan: maskPan(updatedObj.pan) } }
  }

  const result = action === 'block'
    ? await card360.blockCard(card.pan, card.cardType)
    : await card360.unblockCard(card.pan, card.cardType)

  if (result.code === '00') {
    card.cardStatus = action === 'block' ? '2' : '1'
    await card.save()
  }

  const cardObj = card.toObject()
  return { card: { ...cardObj, pan: maskPan(cardObj.pan) }, ...result }
}

/**
 * Delete a card.
 */
export async function deleteCard(userId, cardId) {
  const card = await Card.findOneAndDelete({ _id: cardId, userId })
  if (!card) throw new NotFoundError('Card not found')
  return { message: 'Card removed' }
}

/**
 * Get card balance with cache support.
 */
export async function getCardBalance(userId, cardId) {
  const card = await Card.findOne({ _id: cardId, userId })
  if (!card) throw new NotFoundError('Card not found')

  const cached = await CardBalance.findOne({
    pan: card.pan,
    fetchedAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
  }).sort({ fetchedAt: -1 })

  if (cached) {
    const balObj = cached.toObject()
    return { balance: { ...balObj, pan: maskPan(balObj.pan) }, fromCache: true }
  }

  const data = await card360.getBalance(card.pan, card.cardType)
  const balance = await CardBalance.findOneAndUpdate(
    { pan: card.pan },
    {
      cardId:              card._id,
      availableBalance:    data.availableBalance,
      ledgerBalance:       data.ledgerBalance,
      currency:            data.currency   || 'NGN',
      responseCode:        data.code       || '00',
      responseDescription: data.description || 'Successful',
      fetchedAt:           new Date()
    },
    { upsert: true, new: true }
  )

  const balObj = balance.toObject()
  return { balance: { ...balObj, pan: maskPan(balObj.pan) }, fromCache: false }
}

/**
 * Verify card balance and deduct funds atomically in cache/mock.
 */
export async function verifyAndDeductBalance(userId, cardId, amountKobo) {
  const card = await Card.findOne({ _id: cardId, userId })
  if (!card) throw new NotFoundError('Card not found')

  const bal = await card360.getBalance(card.pan, card.cardType)
  if ((bal.availableBalance ?? 0) < amountKobo) {
    throw new BadRequestError('Insufficient funds on card')
  }

  await CardBalance.findOneAndUpdate(
    { pan: card.pan },
    {
      $inc: { availableBalance: -amountKobo, ledgerBalance: -amountKobo },
      $set: { fetchedAt: new Date() }
    },
    { sort: { fetchedAt: -1 }, upsert: true }
  )

  return card
}

/**
 * Deduct card balance directly by PAN (used during split / batch allocations).
 */
export async function deductBalanceByPan(pan, amountKobo) {
  await CardBalance.findOneAndUpdate(
    { pan },
    {
      $inc: { availableBalance: -amountKobo, ledgerBalance: -amountKobo },
      $set: { fetchedAt: new Date() }
    },
    { sort: { fetchedAt: -1 }, upsert: true }
  )
}
