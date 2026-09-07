import { z } from 'zod'

export const addCardSchema = z.object({
  pan:         z.string().min(13).max(19),
  expiryDate:  z.string().regex(/^\d{4}$/, 'expiryDate must be YYMM e.g. 2612'),
  firstName:   z.string().optional(),
  lastName:    z.string().optional(),
  nameOnCard:  z.string().optional(),
  cardProgram: z.enum(['VERVE', 'VISA', 'MASTERCARD']).optional(),
  customerId:  z.string().optional(),
  cardStatus:  z.enum(['0', '1', '2']).default('1'),
  cardType:    z.enum(['debit', 'prepaid']),
  label:       z.string().optional(),
  bank:        z.string().optional(),
  accountNumber: z.string().length(10, 'accountNumber must be 10 digits'),
  color:       z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'color must be a hex code').optional(),
  isDefault:   z.boolean().default(false),
  spendLimit:  z.number().int().positive().optional(),
})

export const updateCardSchema = addCardSchema.partial()
