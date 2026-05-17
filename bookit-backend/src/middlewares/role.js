const { sendError } = require('../utils/response')

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized.', 401)
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 'Forbidden. You do not have access to this resource.', 403)
    }

    next()
  }
}

module.exports = { authorize }