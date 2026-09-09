import { z } from 'zod'

export const createBusinessCardSchema = z.object({
  assignedTo:         z.string().optional(),
  department:         z.string().optional(),
  label:              z.string().optional(),
  purpose:            z.string().optional(),
  budget:             z.number().positive('budget must be a positive number'),
  merchantCategories: z.array(z.string()).optional(),
  expiresAt:          z.string().optional(),
  approvalThreshold:  z.number().positive().optional().nullable(),
})

export const approvalSchema = z.object({
  requestId: z.string().min(1, 'requestId is required'),
  action:    z.enum(['approve', 'reject']),
  note:      z.string().optional(),
})
