import jwt from 'jsonwebtoken'
import User from './models/User.model.js'
import BlockedToken from './models/BlockedToken.model.js'
import { config } from '../../shared/config/env.js'
import { ConflictError, UnauthorizedError } from '../../shared/errors/httpErrors.js'

function signToken(id) {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  })
}

export async function registerUser({ name, email, password, role, businessName }) {
  const exists = await User.findOne({ email })
  if (exists) {
    throw new ConflictError('Email already registered')
  }

  const user = await User.create({ name, email, password, role, businessName })
  const token = signToken(user._id)

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  }
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email })
  if (!user) {
    throw new UnauthorizedError('Invalid credentials')
  }

  const match = await user.comparePassword(password)
  if (!match) {
    throw new UnauthorizedError('Invalid credentials')
  }

  const token = signToken(user._id)

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  }
}

export async function logoutUser(token) {
  const decoded = jwt.decode(token)
  if (!decoded?.exp) return

  const expiresAt = new Date(decoded.exp * 1000)
  await BlockedToken.updateOne(
    { token },
    { token, expiresAt },
    { upsert: true }
  )
}

export async function verifyAndResolveUser(token) {
  const decoded = jwt.verify(token, config.jwtSecret)

  const blocked = await BlockedToken.exists({ token })
  if (blocked) {
    throw new UnauthorizedError('Token has been revoked — please log in again')
  }

  const user = await User.findById(decoded.id).select('-password')
  if (!user) {
    throw new UnauthorizedError('User not found')
  }

  return user
}

export async function findUserById(userId) {
  return User.findById(userId).select('-password')
}
