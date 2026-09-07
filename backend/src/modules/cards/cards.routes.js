import { Router } from 'express'
import {
  getCards, addCard, getCard, updateCard, deleteCard, getCardBalance,
} from './cards.controller.js'
import { protect } from '../../shared/middleware/auth.middleware.js'
import { validate } from '../../shared/middleware/validate.middleware.js'
import { addCardSchema, updateCardSchema } from './cards.schemas.js'

const router = Router()

router.use(protect)

router.route('/')
  .get(getCards)
  .post(validate(addCardSchema), addCard)

router.route('/:id')
  .get(getCard)
  .patch(validate(updateCardSchema), updateCard)
  .delete(deleteCard)

router.get('/:id/balance', getCardBalance)

export default router
