const pool = require('../../config/db')
const { getPagination, paginatedResponse } = require('../../utils/pagination')

const getAll = async (query) => {
  const { page, limit, offset } = getPagination(query)

  const conditions = []
  const params = []
  let i = 1

  if (query.role) {
    conditions.push(`role = $${i++}`)
    params.push(query.role)
  }

  if (query.search) {
    conditions.push(`(name ILIKE $${i} OR email ILIKE $${i})`)
    params.push(`%${query.search}%`)
    i++
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM users ${where}`, params
  )
  const total = parseInt(countResult.rows[0].count)

  const result = await pool.query(
    `SELECT id, name, email, phone_number, role, created_at
     FROM users
     ${where}
     ORDER BY created_at DESC
     LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limit, offset]
  )

  return paginatedResponse(result.rows, total, page, limit)
}

const updateRole = async (id, role) => {
  const valid = ['customer', 'staff', 'admin']
  if (!valid.includes(role)) {
    throw { status: 400, message: 'Invalid role.' }
  }

  const result = await pool.query(
    `UPDATE users SET role = $1 WHERE id = $2
     RETURNING id, name, email, phone_number, role`,
    [role, id]
  )

  if (result.rows.length === 0) {
    throw { status: 404, message: 'User not found.' }
  }

  return result.rows[0]
}

const remove = async (id) => {
  const hasReservations = await pool.query(
    `SELECT id FROM reservations WHERE user_id = $1
     AND status IN ('pending','confirmed') LIMIT 1`,
    [id]
  )

  if (hasReservations.rows.length > 0) {
    throw { status: 409, message: 'Cannot delete user with active reservations.' }
  }

  const result = await pool.query(
    'DELETE FROM users WHERE id = $1 RETURNING id, name, email, role',
    [id]
  )

  if (result.rows.length === 0) {
    throw { status: 404, message: 'User not found.' }
  }

  return result.rows[0]
}

module.exports = { getAll, updateRole, remove }