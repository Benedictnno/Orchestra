import { Router } from 'express'
import { protect } from '../../shared/middleware/auth.middleware.js'
import { getInsights, getSavings } from './insights.controller.js'

const router = Router()
router.use(protect)

router.get('/',         getInsights)
router.post('/savings', getSavings)

export default router
