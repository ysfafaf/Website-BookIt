const { sendError } = require('../utils/response')

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err)

  // PostgreSQL unique violation (double booking safety net)
  if (err.code === '23505') {
    return sendError(res, 'This time slot is already booked.', 409)
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return sendError(res, 'Referenced resource not found.', 400)
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token.', 401)
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token has expired.', 401)
  }

  // Custom app errors (thrown with { status, message })
  if (err.status) {
    return sendError(res, err.message, err.status)
  }

  // Default
  return sendError(res, 'Internal server error.', 500)
}

module.exports = errorHandler