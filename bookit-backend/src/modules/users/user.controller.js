const userService = require('./user.service')
const asyncHandler = require('../../utils/asyncHandler')
const { sendSuccess } = require('../../utils/response')

const getAll = asyncHandler(async (req, res) => {
  const data = await userService.getAll(req.query)
  return sendSuccess(res, data)
})

const updateRole = asyncHandler(async (req, res) => {
  const data = await userService.updateRole(req.params.id, req.body.role)
  return sendSuccess(res, data, 'User role updated.')
})

const remove = asyncHandler(async (req, res) => {
  const data = await userService.remove(req.params.id)
  return sendSuccess(res, data, 'User deleted.')
})

module.exports = { getAll, updateRole, remove }