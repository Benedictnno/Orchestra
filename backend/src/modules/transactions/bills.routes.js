import { Router } from 'express'
import { protect } from '../../shared/middleware/auth.middleware.js'
import { validate } from '../../shared/middleware/validate.middleware.js'
import { billPaymentSchema } from './transactions.schemas.js'
import { createBillPayment, getBillPayments } from './bills.controller.js'

const router = Router()

router.use(protect)

router.get('/',      getBillPayments)
router.post('/',     validate(billPaymentSchema), createBillPayment)

export default router
