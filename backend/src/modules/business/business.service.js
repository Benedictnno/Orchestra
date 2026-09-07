import BusinessCard from './models/BusinessCard.model.js'
import ApprovalRequest from './models/ApprovalRequest.model.js'
import { cardsService } from '../cards/index.js'
import { nairaToKobo } from '../../shared/utils/formatters.js'
import { NotFoundError, ForbiddenError } from '../../shared/errors/httpErrors.js'
import { withTransaction } from '../../shared/database/transaction.js'

/**
 * Get all business cards for an organization admin with pending approval counts.
 */
export async function getBusinessCards(businessUserId) {
  const cards = await BusinessCard.find({ businessUserId }).lean()
  if (!cards.length) return []

  const cardIds = cards.map(c => c._id)
  const pendingCounts = await ApprovalRequest.aggregate([
    { $match: { businessCardId: { $in: cardIds }, status: 'pending' } },
    { $group: { _id: '$businessCardId', count: { $sum: 1 } } }
  ])

  const countMap = new Map(pendingCounts.map(p => [p._id.toString(), p.count]))
  return cards.map(card => ({
    ...card,
    pendingApprovals: countMap.get(card._id.toString()) || 0
  }))
}

/**
 * Get pending approvals queue for cards belonging to this business user.
 */
export async function getApprovalQueue(businessUserId) {
  const cards = await BusinessCard.find({ businessUserId }).select('_id').lean()
  const cardIds = cards.map(c => c._id)

  return ApprovalRequest.find({ businessCardId: { $in: cardIds }, status: 'pending' })
    .populate('businessCardId', 'assignedTo purpose pan')
    .sort({ createdAt: -1 })
    .lean()
}

/**
 * Create a new business expense card.
 */
export async function createBusinessCard(businessUserId, {
  assignedTo, purpose, budget, merchantCategories, expiresAt, approvalThreshold
}) {
  return BusinessCard.create({
    businessUserId,
    assignedTo,
    purpose,
    budget: nairaToKobo(budget),
    merchantCategories,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    approvalThreshold: approvalThreshold ? nairaToKobo(approvalThreshold) : null,
    pan: `BIZ${Date.now()}`,
  })
}

/**
 * Update business card status (active/suspended).
 */
export async function updateBusinessCard(businessUserId, cardId, { status }) {
  const card = await BusinessCard.findOneAndUpdate(
    { _id: cardId, businessUserId },
    { status },
    { new: true }
  )
  if (!card) throw new NotFoundError('Business card not found')
  return card
}

/**
 * Handle expense approval/rejection.
 */
export async function handleApproval(businessUserId, { requestId, action, note }) {
  return withTransaction(async (session) => {
    const request = await ApprovalRequest.findById(requestId).populate('businessCardId').session(session)
    if (!request) throw new NotFoundError('Request not found')

    if (request.businessCardId.businessUserId.toString() !== businessUserId.toString()) {
      throw new ForbiddenError('Forbidden')
    }

    request.status     = action === 'approve' ? 'approved' : 'rejected'
    request.reviewedBy = businessUserId
    request.reviewedAt = new Date()
    request.reviewNote = note
    await request.save({ session })

    if (action === 'approve') {
      const card = request.businessCardId
      card.amountSpent += request.amount
      if (card.amountSpent >= card.budget) card.status = 'exhausted'
      await card.save({ session })

      // Deduct from business user's primary card balance via cards service
      const primaryCard = await cardsService.getPrimaryOrFirstCard(businessUserId)
      if (primaryCard) {
        await cardsService.deductBalanceByPan(primaryCard.pan, request.amount)
      }

      // Record transaction via transactions service
      try {
        const { transactionsService } = await import('../transactions/index.js')
        await transactionsService.recordTransaction({
          userId:          businessUserId,
          amount:          request.amount,
          currency:        'NGN',
          category:        'other',
          pan:             card.pan,
          merchant:        request.merchant,
          narration:       request.reason,
          reference:       `APV-${Date.now()}`,
          transactionDate: new Date(),
        })
      } catch {
        // If transactions module not loaded yet, skip
      }
    }

    return request
  })
}
