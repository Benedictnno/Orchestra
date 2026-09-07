import { Router } from 'express'
import { protect }  from '../../shared/middleware/auth.middleware.js'
import { validate } from '../../shared/middleware/validate.middleware.js'
import { chatSchema } from './insights.schemas.js'
import { handleChat, getChatHistory, clearChat } from './chat.controller.js'

const router = Router()
router.use(protect)

router.get('/',        getChatHistory)
router.get('/history', getChatHistory)
router.post('/',       validate(chatSchema), handleChat)
router.delete('/',     clearChat)

export default router
