import { Router } from 'express'
import { getRule, upsertRule, simulate } from './routing.controller.js'
import { protect } from '../../shared/middleware/auth.middleware.js'
import { validate } from '../../shared/middleware/validate.middleware.js'
import { upsertRoutingSchema, simulateRoutingSchema } from './routing.schemas.js'

const router = Router()

router.use(protect)

router.route('/').get(getRule).put(validate(upsertRoutingSchema), upsertRule)
router.post('/simulate', validate(simulateRoutingSchema), simulate)

export default router
