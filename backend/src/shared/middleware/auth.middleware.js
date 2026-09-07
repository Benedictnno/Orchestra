import { verifyAndResolveUser } from '../../modules/auth/auth.service.js'

export async function protect(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]
  try {
    req.user = await verifyAndResolveUser(token)
    req.token = token // forward raw token so logout can read it
    next()
  } catch (err) {
    res.status(err.statusCode || 401).json({ error: err.message || 'Invalid or expired token' })
  }
}
