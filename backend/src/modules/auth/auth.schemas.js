import { z } from 'zod'

export const registerSchema = z.object({
  name:         z.string().min(2, 'Name must be at least 2 characters'),
  email:        z.string().email('Invalid email address'),
  password:     z.string().min(8, 'Password must be at least 8 characters'),
  role:         z.enum(['individual', 'business']).default('individual'),
  businessName: z.string().optional(),
}).refine(
  data => data.role !== 'business' || !!data.businessName,
  { message: 'businessName is required for business accounts', path: ['businessName'] }
)

export const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})
