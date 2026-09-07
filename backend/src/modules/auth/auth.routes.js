import { Router } from 'express'
import { register, login, getMe, logout } from './auth.controller.js'
import { protect } from '../../shared/middleware/auth.middleware.js'
import { validate } from '../../shared/middleware/validate.middleware.js'
import { registerSchema, loginSchema } from './auth.schemas.js'

const router = Router()

router.post('/register', validate(registerSchema), register)
router.post('/login',    validate(loginSchema), login)
router.get('/me',        protect, getMe)
router.post('/logout',   protect, logout)

export default router
