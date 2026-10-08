import { Router } from 'express'
import { getOrchestraCard, getFundingSources, selectFundingSource, routePayment } from './orchestration.controller.js'
import { protect } from '../../shared/middleware/auth.middleware.js'
import { validate } from '../../shared/middleware/validate.middleware.js'
import { selectSourceSchema, routePaymentSchema } from './orchestration.schemas.js'

const router = Router()

router.use(protect)

router.get('/card', getOrchestraCard)
router.get('/sources', getFundingSources)
router.post('/select-source', validate(selectSourceSchema), selectFundingSource)
router.post('/pay', validate(routePaymentSchema), routePayment)

export default router
