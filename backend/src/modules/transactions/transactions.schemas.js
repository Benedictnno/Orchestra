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

export const transferSchema = z.object({
  amount:           z.number().positive('amount must be a positive number in Naira'),
  sourceCardId:     z.string().min(1, 'sourceCardId is required'),
  recipientBank:    z.string().min(1, 'recipientBank is required'),
  recipientAccount: z.string().length(10, 'NUBAN must be 10 digits'),
  recipientName:    z.string().min(1, 'recipientName is required'),
  category:         z.enum(['food', 'transport', 'subscriptions', 'utilities',
                           'entertainment', 'shopping', 'transfer', 'bills', 'other']).optional(),
  narration:        z.string().optional(),
})

export const billPaymentSchema = z.object({
  amount:       z.number().positive('amount must be a positive number in Naira'),
  sourceCardId: z.string().min(1, 'sourceCardId is required'),
  billerCode:   z.string().min(1, 'billerCode is required'),
  billerName:   z.string().optional(),
  customerId:   z.string().min(1, 'customerId is required'),
  narration:    z.string().optional(),
})
