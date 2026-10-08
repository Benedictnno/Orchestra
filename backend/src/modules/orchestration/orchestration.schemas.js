import { z } from 'zod'

export const selectSourceSchema = z.object({
  fundingSourceId: z.string().min(1, 'fundingSourceId is required'),
})

export const routePaymentSchema = z.object({
  amount:      z.number().int().positive('amount must be a positive integer in kobo'),
  merchant:    z.string().max(255).optional(),
  category:    z.string().max(64).optional(),
  narration:   z.string().max(512).optional(),
})
