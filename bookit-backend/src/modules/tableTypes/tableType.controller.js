const tableTypeService = require('./tableType.service')
const { sendSuccess, sendError } = require('../../utils/response')

const getAll = async (req, res) => {
  try {
    const data = await tableTypeService.getAll()
    return sendSuccess(res, data)
  } catch (err) {
    return sendError(res, err.message, err.status || 500)
  }
}

const getAvailable = async (req, res) => {
  try {
    const { date, time } = req.query

    if (!date || !time) {
      return sendError(res, 'date and time query params are required.', 400)
    }

    const data = await tableTypeService.getAvailable({ date, time })
    return sendSuccess(res, data)
  } catch (err) {
    return sendError(res, err.message, err.status || 500)
  }
}

const create = async (req, res) => {
  try {
    const { name } = req.body
    if (!name) return sendError(res, 'Name is required.', 400)

    const data = await tableTypeService.create({ name })
    return sendSuccess(res, data, 'Table type created.', 201)
  } catch (err) {
    return sendError(res, err.message, err.status || 500)
  }
}

const remove = async (req, res) => {
  try {
    const data = await tableTypeService.remove(req.params.id)
    return sendSuccess(res, data, 'Table type deleted.')
  } catch (err) {
    return sendError(res, err.message, err.status || 500)
  }
}

module.exports = { getAll, getAvailable, create, remove }