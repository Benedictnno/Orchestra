import { z } from 'zod'

export const upsertRoutingSchema = z.object({
  mode:          z.enum(['primary', 'balanced', 'auto-split']),
  primaryCardId: z.string().optional(),
  cardOrder:     z.array(z.string()).optional(),
})

export const simulateRoutingSchema = z.object({
  amount:   z.number().int().positive('amount must be a positive integer in kobo'),
  merchant: z.string().optional(),
  category: z.enum(['food', 'transport', 'subscriptions', 'utilities',
                    'entertainment', 'shopping', 'transfer', 'bills', 'other']).optional(),
  save:     z.boolean().default(false),
})
