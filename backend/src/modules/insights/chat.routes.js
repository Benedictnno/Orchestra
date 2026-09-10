import { Router } from 'express'
import { protect }  from '../../shared/middleware/auth.middleware.js'
import { validate } from '../../shared/middleware/validate.middleware.js'
import { chatSchema } from './insights.schemas.js'
import {
  handleChat,
  getChatHistory,
  clearChat,
  listSessions,
  createSession,
  getSession,
  deleteSession,
} from './chat.controller.js'

const router = Router()
router.use(protect)

router.get('/sessions',        listSessions)
router.post('/sessions',       createSession)
router.get('/sessions/:sessionId', getSession)
router.delete('/sessions/:sessionId', deleteSession)

router.get('/history',         getChatHistory)
router.get('/:sessionId',      getSession)
router.delete('/:sessionId',   deleteSession)

router.get('/',                getChatHistory)
router.post('/',               validate(chatSchema), handleChat)
router.delete('/',             clearChat)

export default router

