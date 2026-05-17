const Joi = require('joi')

const createTableTypeSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must be less than 100 characters',
    'any.required': 'Table type name is required'
  })
})

module.exports = { createTableTypeSchema }