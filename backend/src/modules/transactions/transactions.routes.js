import { Router } from 'express'
import {
  getTransactions, getTransaction, createTransaction, getTransactionSummary
} from './transactions.controller.js'
import { protect } from '../../shared/middleware/auth.middleware.js'
import { validate } from '../../shared/middleware/validate.middleware.js'
import { createTransactionSchema } from './transactions.schemas.js'

const router = Router()

router.use(protect)

router.route('/')
  .get(getTransactions)
  .post(validate(createTransactionSchema), createTransaction)

router.get('/summary', getTransactionSummary)
router.get('/:id', getTransaction)

export default router
