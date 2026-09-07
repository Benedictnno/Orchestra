import { Router } from 'express'
import { protect } from '../../shared/middleware/auth.middleware.js'
import { validate } from '../../shared/middleware/validate.middleware.js'
import { transferSchema } from './transactions.schemas.js'
import { createTransfer, getTransfers } from './transfers.controller.js'

const router = Router()

router.use(protect)

router.get('/',      getTransfers)
router.post('/',     validate(transferSchema), createTransfer)

export default router
