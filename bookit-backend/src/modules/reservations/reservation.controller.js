const reservationService = require('./reservation.service')
const { sendSuccess, sendError } = require('../../utils/response')
const asyncHandler = require('../../utils/asyncHandler')

const create = async (req, res) => {
  try {
    const { table_type_id, date, time, description } = req.body

    if (!table_type_id || !date || !time) {
      return sendError(res, 'table_type_id, date, and time are required.', 400)
    }

    // Validate date is not in the past
    const reservationDate = new Date(`${date}T${time}`)
    if (reservationDate < new Date()) {
      return sendError(res, 'Reservation date and time cannot be in the past.', 400)
    }

    const data = await reservationService.create({
      user_id: req.user.id,
      table_type_id,
      date,
      time,
      description
    })

    return sendSuccess(res, data, 'Reservation created successfully.', 201)
  } catch (err) {
    return sendError(res, err.message, err.status || 500)
  }
}

const getAll = asyncHandler(async (req, res) => {
  const data = await reservationService.getAll({
    role: req.user.role,
    user_id: req.user.id,
    query: req.query
  })
  return sendSuccess(res, data)
})

const getById = async (req, res) => {
  try {
    const data = await reservationService.getById(req.params.id, req.user)
    return sendSuccess(res, data)
  } catch (err) {
    return sendError(res, err.message, err.status || 500)
  }
}

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body

    if (!status) {
      return sendError(res, 'status is required.', 400)
    }

    const data = await reservationService.updateStatus(
      req.params.id,
      status,
      req.user.role
    )

    return sendSuccess(res, data, `Reservation ${status} successfully.`)
  } catch (err) {
    return sendError(res, err.message, err.status || 500)
  }
}

const cancel = asyncHandler(async (req, res) => {
  // ── Make sure we pass req.user.id correctly ───────────────────
  const data = await reservationService.cancel(
    req.params.id,
    req.user.id    // ← this comes from JWT token
  )
  return sendSuccess(res, data, 'Reservation cancelled successfully.')
})

const getStats = asyncHandler(async (req, res) => {
  const data = await reservationService.getStats()
  return sendSuccess(res, data)
})

module.exports = { create, getAll, getById, updateStatus, cancel, getStats }

