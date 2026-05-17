const Joi = require('joi')

const createTableSchema = Joi.object({
  table_number: Joi.number().integer().min(1).required().messages({
    'number.base': 'Table number must be a number',
    'number.integer': 'Table number must be a whole number',
    'number.min': 'Table number must be at least 1',
    'any.required': 'Table number is required'
  }),
  table_type_id: Joi.string().uuid().required().messages({
    'string.uuid': 'Table type ID must be a valid UUID',
    'any.required': 'Table type ID is required'
  })
})

module.exports = { createTableSchema }