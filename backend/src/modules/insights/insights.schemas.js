import { z } from 'zod'

export const reportSchema = z.object({
  from:   z.string().datetime('from must be an ISO date string'),
  to:     z.string().datetime('to must be an ISO date string'),
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
})

export const chatSchema = z.object({
  message: z.string().min(1, 'message cannot be empty'),
})
