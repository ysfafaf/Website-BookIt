const { sendError } = require('../utils/response')

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,    // return ALL errors at once
      stripUnknown: true    // remove fields not in schema
    })

    if (error) {
      const messages = error.details.map((d) => d.message.replace(/"/g, ''))
      return sendError(res, messages.join(', '), 400)
    }

    req.body = value  // use sanitized value
    next()
  }
}

module.exports = validate