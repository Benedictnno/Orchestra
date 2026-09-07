import { Router } from 'express'
import { protect } from '../../shared/middleware/auth.middleware.js'
import { getReport } from './report.controller.js'

const router = Router()
router.use(protect)

router.get('/', getReport)

export default router
