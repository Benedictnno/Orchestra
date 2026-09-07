import { Router } from 'express'
import {
  getBusinessCards, createBusinessCard,
  updateBusinessCard, handleApproval, getApprovalQueue
} from './business.controller.js'
import { protect } from '../../shared/middleware/auth.middleware.js'
import { requireRole } from '../../shared/middleware/role.middleware.js'
import { validate } from '../../shared/middleware/validate.middleware.js'
import { createBusinessCardSchema, approvalSchema } from './business.schemas.js'

const router = Router()

router.use(protect)

router.get('/',         requireRole('business'), getBusinessCards)
router.post('/',        requireRole('business'), validate(createBusinessCardSchema), createBusinessCard)
router.patch('/:id',    requireRole('business'), updateBusinessCard)
router.get('/approvals', requireRole('business'), getApprovalQueue)
router.post('/approve', requireRole('business'), validate(approvalSchema), handleApproval)

export default router
