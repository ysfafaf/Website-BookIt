const Joi = require('joi')

const createReservationSchema = Joi.object({
  table_type_id: Joi.string().uuid().required().messages({
    'string.uuid': 'Table type ID must be a valid UUID',
    'any.required': 'Table type is required'
  }),
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .custom((value, helpers) => {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return helpers.error('any.invalid')
      }
      if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
        return helpers.message('Reservation date cannot be in the past')
      }
      return value
    })
    .messages({
      'string.pattern.base': 'Date must be in YYYY-MM-DD format',
      'any.required': 'Date is required'
    }),
  time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):[0-5]\d$/)
    .required()
    .messages({
      'string.pattern.base': 'Time must be in HH:MM format (e.g. 19:00)',
      'any.required': 'Time is required'
    }),
  description: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Description must be less than 500 characters'
  })
})

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('confirmed', 'rejected', 'completed', 'cancelled')
    .required()
    .messages({
      'any.only': 'Status must be one of: confirmed, rejected, completed, cancelled',
      'any.required': 'Status is required'
    })
})

module.exports = { createReservationSchema, updateStatusSchema }