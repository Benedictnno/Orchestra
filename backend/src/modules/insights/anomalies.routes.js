import { Router } from 'express'
import { protect } from '../../shared/middleware/auth.middleware.js'
import { getAnomalies, scanAnomalies } from './anomalies.controller.js'

const router = Router()
router.use(protect)

router.get('/',      getAnomalies)
router.post('/scan', scanAnomalies)

export default router
