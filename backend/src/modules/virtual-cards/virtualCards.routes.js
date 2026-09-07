import { Router } from 'express'
import {
  getVirtualCards, createVirtualCard, updateVirtualCard, topUpVirtualCard
} from './virtualCards.controller.js'
import { protect } from '../../shared/middleware/auth.middleware.js'
import { validate } from '../../shared/middleware/validate.middleware.js'
import { createVirtualCardSchema, topUpSchema } from './virtualCards.schemas.js'

const router = Router()

router.use(protect)

router.get('/',           getVirtualCards)
router.post('/',          validate(createVirtualCardSchema), createVirtualCard)
router.patch('/:id',      updateVirtualCard)
router.post('/:id/top-up', validate(topUpSchema), topUpVirtualCard)

export default router
