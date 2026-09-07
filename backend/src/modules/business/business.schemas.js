import { z } from 'zod'

export const createBusinessCardSchema = z.object({
  assignedTo:         z.string().optional(),
  purpose:            z.string().optional(),
  budget:             z.number().int().positive('budget must be positive kobo'),
  merchantCategories: z.array(z.string()).optional(),
  expiresAt:          z.string().datetime().optional(),
  approvalThreshold:  z.number().int().positive().optional(),
})

export const approvalSchema = z.object({
  requestId: z.string().min(1, 'requestId is required'),
  action:    z.enum(['approve', 'reject']),
  note:      z.string().optional(),
})
