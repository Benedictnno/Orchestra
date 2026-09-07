import { randomUUID } from 'crypto'
import VirtualCard from './models/VirtualCard.model.js'
import { cardsService } from '../cards/index.js'
import { nairaToKobo } from '../../shared/utils/formatters.js'
import { NotFoundError } from '../../shared/errors/httpErrors.js'

/**
 * Fetch all virtual cards for a user.
 */
export async function getVirtualCards(userId) {
  return VirtualCard.find({ userId }).populate('parentCardId', 'label bank color')
}

/**
 * Create a new virtual card attached to a parent bank card.
 */
export async function createVirtualCard(userId, { label, parentCardId, spendLimit, merchant, autoRenew }) {
  // Ensure parent card exists and is owned by user
  await cardsService.getCardById(userId, parentCardId)

  return VirtualCard.create({
    userId,
    parentCardId,
    label,
    merchant,
    spendLimit: nairaToKobo(spendLimit),
    autoRenew,
    pan: `VIRT${Date.now()}`,
    expiryDate: '2712',
  })
}

/**
 * Update virtual card status: pause, resume, or delete.
 */
export async function updateVirtualCard(userId, cardId, { action }) {
  const vc = await VirtualCard.findOne({ _id: cardId, userId })
  if (!vc) throw new NotFoundError('Virtual card not found')

  if (action === 'pause')  { vc.paused = true;  vc.cardStatus = '2'; await vc.save() }
  if (action === 'resume') { vc.paused = false; vc.cardStatus = '1'; await vc.save() }
  if (action === 'delete') {
    await vc.deleteOne()
    return { success: true }
  }

  return { success: true, virtualCard: vc }
}

/**
 * Top-up virtual card allowance from a source bank card.
 */
export async function topUpVirtualCard(userId, cardId, { amount, sourceCardId }) {
  const amountKobo = nairaToKobo(amount)

  const vc = await VirtualCard.findOne({ _id: cardId, userId })
  if (!vc) throw new NotFoundError('Virtual card not found')

  // Verify and deduct balance from source card via cards service
  const sourceCard = await cardsService.verifyAndDeductBalance(userId, sourceCardId, amountKobo)

  // Update virtual card allowance
  vc.spendLimit += amountKobo
  await vc.save()

  // Record funding transaction via transactions service
  try {
    const { transactionsService } = await import('../transactions/index.js')
    await transactionsService.recordTransaction({
      userId,
      cardId: sourceCard._id,
      pan: sourceCard.pan,
      amount: amountKobo,
      currency: 'NGN',
      type: 'top_up',
      category: 'other',
      merchant: 'Orchestra Internal',
      narration: `Virtual Card Top-up: ${vc.label}`,
      reference: randomUUID(),
    })
  } catch {
    // If transactions module not loaded yet, skip
  }

  return { success: true, spendLimit: vc.spendLimit }
}
