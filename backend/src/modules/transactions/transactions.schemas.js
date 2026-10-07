import { z } from 'zod'

export const createTransactionSchema = z.object({
  amount:          z.number().int().positive('amount must be positive kobo'),
  type:            z.enum(['debit', 'top_up', 'transfer', 'bill_payment']).default('debit').optional(),
  merchant:        z.string().optional(),
  merchantCategory: z.string().optional(),
  category:        z.enum(['food', 'transport', 'subscriptions', 'utilities',
                            'entertainment', 'shopping', 'transfer', 'bills', 'other']).optional(),
  narration:       z.string().optional(),
  transactionDate: z.string().datetime().optional(),
  cardId:          z.string().optional(),
})

// A transfer may be funded from a single legacy card (sourceCardId) or from
// multiple sources pooled together (sourceCardIds). At least one is required.
const hasFundingSource = (d) => Boolean(d.sourceCardId) || (Array.isArray(d.sourceCardIds) && d.sourceCardIds.length > 0)

export const transferSchema = z.object({
  amount:           z.number().positive('amount must be a positive number in Naira'),
  sourceCardId:     z.string().min(1, 'sourceCardId is required').optional(),
  sourceCardIds:    z.array(z.string().min(1)).optional(),
  recipientBank:    z.string().min(1, 'recipientBank is required'),
  recipientAccount: z.string().length(10, 'NUBAN must be 10 digits'),
  recipientName:    z.string().min(1, 'recipientName is required'),
  category:         z.enum(['food', 'transport', 'subscriptions', 'utilities',
                           'entertainment', 'shopping', 'transfer', 'bills', 'other']).optional(),
  narration:        z.string().optional(),
}).refine(hasFundingSource, { message: 'Select at least one funding source' })

// Read-only allocation preview — recipient details are intentionally not required.
export const previewTransferSchema = z.object({
  amount:        z.number().positive('amount must be a positive number in Naira'),
  sourceCardId:  z.string().min(1).optional(),
  sourceCardIds: z.array(z.string().min(1)).optional(),
}).refine(hasFundingSource, { message: 'Select at least one funding source' })

export const billPaymentSchema = z.object({
  amount:       z.number().positive('amount must be a positive number in Naira'),
  sourceCardId: z.string().min(1, 'sourceCardId is required'),
  billerCode:   z.string().min(1, 'billerCode is required'),
  billerName:   z.string().optional(),
  customerId:   z.string().min(1, 'customerId is required'),
  narration:    z.string().optional(),
})
