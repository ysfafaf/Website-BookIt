const tableService = require('./table.service')
const { sendSuccess, sendError } = require('../../utils/response')

const getAll = async (req, res) => {
  try {
    const data = await tableService.getAll()
    return sendSuccess(res, data)
  } catch (err) {
    return sendError(res, err.message, err.status || 500)
  }
}

const getByType = async (req, res) => {
  try {
    const data = await tableService.getByType(req.params.typeId)
    return sendSuccess(res, data)
  } catch (err) {
    return sendError(res, err.message, err.status || 500)
  }
}

const create = async (req, res) => {
  try {
    const { table_number, table_type_id } = req.body

    if (!table_number || !table_type_id) {
      return sendError(res, 'table_number and table_type_id are required.', 400)
    }

    const data = await tableService.create({ table_number, table_type_id })
    return sendSuccess(res, data, 'Table created.', 201)
  } catch (err) {
    return sendError(res, err.message, err.status || 500)
  }
}

const remove = async (req, res) => {
  try {
    const data = await tableService.remove(req.params.id)
    return sendSuccess(res, data, 'Table deleted.')
  } catch (err) {
    return sendError(res, err.message, err.status || 500)
  }
}

module.exports = { getAll, getByType, create, remove }