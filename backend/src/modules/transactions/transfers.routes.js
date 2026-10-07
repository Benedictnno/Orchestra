import { Router } from 'express'
import { protect } from '../../shared/middleware/auth.middleware.js'
import { validate } from '../../shared/middleware/validate.middleware.js'
import { transferSchema, previewTransferSchema } from './transactions.schemas.js'
import { createTransfer, previewTransfer, getTransfers } from './transfers.controller.js'

const router = Router()

router.use(protect)

router.get('/',      getTransfers)
router.post('/',     validate(transferSchema), createTransfer)
router.post('/preview', validate(previewTransferSchema), previewTransfer)

export default router
