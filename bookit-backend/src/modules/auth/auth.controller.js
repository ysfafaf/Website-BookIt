const authService = require('./auth.service')
const { sendSuccess, sendError } = require('../../utils/response')

const register = async (req, res) => {
  try {
    const { name, email, password, phone_number } = req.body
    const user = await authService.register({ name, email, password, phone_number })
    return sendSuccess(res, user, 'Registration successful.', 201)
  } catch (err) {
    return sendError(res, err.message, err.status || 500)
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return sendError(res, 'Email and password are required.', 400)
    }

    const result = await authService.login({ email, password })

    return sendSuccess(res, result, 'Login successful.')
  } catch (err) {
    return sendError(res, err.message, err.status || 500)
  }
}

// GET /api/auth/me — returns current logged in user
const me = async (req, res) => {
  return sendSuccess(res, req.user, 'Authenticated user.')
}

module.exports = { register, login, me }