import * as authService from './auth.service.js'

export async function register(req, res) {
  const result = await authService.registerUser(req.body)
  res.status(201).json(result)
}

export async function login(req, res) {
  const result = await authService.loginUser(req.body)
  res.json(result)
}

export async function getMe(req, res) {
  res.json({ user: req.user })
}

export async function logout(req, res) {
  await authService.logoutUser(req.token)
  res.json({ message: 'Logged out successfully' })
}
