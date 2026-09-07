import { z } from 'zod'

export const createVirtualCardSchema = z.object({
  parentCardId: z.string().min(1, 'parentCardId is required'),
  label:        z.string().min(1, 'label is required'),
  merchant:     z.string().optional(),
  spendLimit:   z.number().positive('spendLimit must be a positive number in Naira'),
  autoRenew:    z.boolean().default(true),
})

export const topUpSchema = z.object({
  sourceCardId: z.string().min(1, 'sourceCardId is required'),
  amount:       z.number().positive('amount must be a positive number in Naira'),
})
