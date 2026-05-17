const pool = require('../../config/db')

// ─── CORE: Auto-assign available table ───────────────────────────────────────
const findAvailableTable = async (table_type_id, date, time, client) => {
  // Find the first table of the requested type
  // that has NO active reservation at the given date & time
  const result = await client.query(
    `SELECT t.id
     FROM tables t
     WHERE t.table_type_id = $1
       AND t.id NOT IN (
         SELECT r.table_id
         FROM reservations r
         WHERE r.date = $2
           AND r.time = $3
           AND r.status NOT IN ('rejected', 'cancelled')
       )
     ORDER BY t.id ASC
     LIMIT 1`,
    [table_type_id, date, time]
  )
  return result.rows[0] || null
}

// ─── CREATE reservation (with auto-assign) ───────────────────────────────────
const create = async ({ user_id, table_type_id, date, time, description }) => {
  // Use a transaction to prevent race conditions
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // 1. Lock & find available table
    const availableTable = await findAvailableTable(table_type_id, date, time, client)

    if (!availableTable) {
      throw { status: 409, message: 'No available tables for the selected type, date, and time.' }
    }

    // 2. Create the reservation with auto-assigned table
    const result = await client.query(
      `INSERT INTO reservations (user_id, table_id, date, time, status, description)
       VALUES ($1, $2, $3, $4, 'pending', $5)
       RETURNING *`,
      [user_id, availableTable.id, date, time, description || null]
    )

    await client.query('COMMIT')

    // 3. Return with full details
    const reservation = await getById(result.rows[0].id)
    return reservation
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

// ─── GET ALL (role-aware) ─────────────────────────────────────────────────────
const { getPagination, paginatedResponse } = require('../../utils/pagination')

const getAll = async ({ role, user_id, query }) => {
  const { page, limit, offset } = getPagination(query)

  // ─── Build WHERE clause dynamically ───────────────────────────
  const conditions = []
  const params = []
  let paramIndex = 1

  // Role filter — customer only sees own reservations
  if (role === 'customer') {
    conditions.push(`r.user_id = $${paramIndex++}`)
    params.push(user_id)
  }

  // Filter by status
  if (query.status && query.status !== 'all') {
    conditions.push(`r.status = $${paramIndex++}`)
    params.push(query.status)
  }

  // Filter by date
  if (query.date) {
    conditions.push(`r.date = $${paramIndex++}`)
    params.push(query.date)
  }

  // Filter by table type
  if (query.table_type_id) {
    conditions.push(`t.table_type_id = $${paramIndex++}`)
    params.push(query.table_type_id)
  }

  // Search by customer name or table number
  if (query.search) {
    conditions.push(
      `(u.name ILIKE $${paramIndex} OR CAST(t.table_number AS TEXT) ILIKE $${paramIndex})`
    )
    params.push(`%${query.search}%`)
    paramIndex++
  }

  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : ''

  // ─── Count total (for pagination) ─────────────────────────────
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM reservations r
     JOIN users u  ON u.id = r.user_id
     JOIN tables t ON t.id = r.table_id
     ${whereClause}`,
    params
  )
  const total = parseInt(countResult.rows[0].count)

  // ─── Fetch paginated data ──────────────────────────────────────
  const dataResult = await pool.query(
    `SELECT
       r.id, r.date, r.time, r.status, r.description, r.created_at,
       u.id AS user_id, u.name AS user_name, u.email AS user_email,
       u.phone_number AS user_phone,
       t.id AS table_id, t.table_number,
       tt.id AS table_type_id, tt.name AS table_type_name
     FROM reservations r
     JOIN users u       ON u.id  = r.user_id
     JOIN tables t      ON t.id  = r.table_id
     JOIN table_types tt ON tt.id = t.table_type_id
     ${whereClause}
     ORDER BY r.date DESC, r.time DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  )

  return paginatedResponse(
    dataResult.rows.map(formatReservation),
    total,
    page,
    limit
  )
}

// ─── GET BY ID ────────────────────────────────────────────────────────────────
const getById = async (id, user = null) => {
  const result = await pool.query(
    `SELECT
      r.id, r.date, r.time, r.status, r.description, r.created_at,
      u.id AS user_id, u.name AS user_name, u.email AS user_email,
      t.id AS table_id, t.table_number,
      tt.id AS table_type_id, tt.name AS table_type_name
     FROM reservations r
     JOIN users u ON u.id = r.user_id
     JOIN tables t ON t.id = r.table_id
     JOIN table_types tt ON tt.id = t.table_type_id
     WHERE r.id = $1`,
    [id]
  )

  if (result.rows.length === 0) {
    throw { status: 404, message: 'Reservation not found.' }
  }

  const reservation = result.rows[0]

  // Customer can only view their own
  if (user && user.role === 'customer' && reservation.user_id !== user.id) {
    throw { status: 403, message: 'Forbidden.' }
  }

  return formatReservation(reservation)
}

// ─── UPDATE STATUS ────────────────────────────────────────────────────────────
const updateStatus = async (id, newStatus, role) => {
  // ── Get raw reservation ───────────────────────────────────────
  const raw = await pool.query(
    'SELECT * FROM reservations WHERE id = $1',
    [id]
  )

  if (raw.rows.length === 0) {
    throw { status: 404, message: 'Reservation not found.' }
  }

  const current = raw.rows[0].status

  // ── Status lifecycle rules (plain JS object, no TypeScript) ───
  const allowedTransitions = {
    admin: {
      pending:   ['confirmed', 'rejected'],
      confirmed: ['completed', 'cancelled'],
    },
    staff: {
      confirmed: ['completed'],
    }
  }

  const transitions = allowedTransitions[role] || {}
  const allowed = transitions[current] || []

  if (!allowed.includes(newStatus)) {
    throw {
      status: 400,
      message: `Cannot transition from '${current}' to '${newStatus}' as ${role}.`
    }
  }

  // ── Perform update ────────────────────────────────────────────
  await pool.query(
    `UPDATE reservations SET status = $1 WHERE id = $2`,
    [newStatus, id]
  )

  // ── Return formatted result ───────────────────────────────────
  return getById(id)
}

// ─── CANCEL (customer cancels own reservation) ────────────────────────────────
const cancel = async (id, user_id) => {
  // ── Get raw reservation directly (not formatted) ──────────────
  const raw = await pool.query(
    'SELECT * FROM reservations WHERE id = $1',
    [id]
  )

  if (raw.rows.length === 0) {
    throw { status: 404, message: 'Reservation not found.' }
  }

  const reservation = raw.rows[0]

  // ── Check ownership using raw DB row ──────────────────────────
  if (reservation.user_id !== user_id) {
    throw { status: 403, message: 'You can only cancel your own reservations.' }
  }

  // ── Check status allows cancellation ─────────────────────────
  if (!['pending', 'confirmed'].includes(reservation.status)) {
    throw {
      status: 400,
      message: `Cannot cancel a reservation with status '${reservation.status}'.`
    }
  }

  // ── Perform cancel ────────────────────────────────────────────
  await pool.query(
    `UPDATE reservations SET status = 'cancelled' WHERE id = $1`,
    [id]
  )

  // ── Return formatted result ───────────────────────────────────
  return getById(id)
}

// ─── FORMAT helper ────────────────────────────────────────────────────────────
const formatReservation = (row) => ({
  id: row.id,
  date: row.date,
  time: row.time,
  status: row.status,
  description: row.description,
  created_at: row.created_at,
  user: {
    id: row.user_id,
    name: row.user_name,
    email: row.user_email
  },
  table: {
    id: row.table_id,
    table_number: row.table_number,
    table_type_id: row.table_type_id,
    table_type_name: row.table_type_name
  }
})

const getStats = async () => {
  const result = await pool.query(
    `SELECT
       COUNT(*)                                            AS total,
       COUNT(*) FILTER (WHERE status = 'pending')         AS pending,
       COUNT(*) FILTER (WHERE status = 'confirmed')       AS confirmed,
       COUNT(*) FILTER (WHERE status = 'rejected')        AS rejected,
       COUNT(*) FILTER (WHERE status = 'completed')       AS completed,
       COUNT(*) FILTER (WHERE status = 'cancelled')       AS cancelled
     FROM reservations`
  )

  const tableResult = await pool.query(
    `SELECT tt.name, COUNT(t.id) AS total
     FROM table_types tt
     LEFT JOIN tables t ON t.table_type_id = tt.id
     GROUP BY tt.name
     ORDER BY tt.name ASC`
  )

  const recentResult = await pool.query(
    `SELECT
       r.id, r.date, r.time, r.status,
       u.name AS user_name,
       t.table_number,
       tt.name AS table_type_name
     FROM reservations r
     JOIN users u        ON u.id  = r.user_id
     JOIN tables t       ON t.id  = r.table_id
     JOIN table_types tt ON tt.id = t.table_type_id
     ORDER BY r.created_at DESC
     LIMIT 5`
  )

  return {
    counts: {
      total:     parseInt(result.rows[0].total),
      pending:   parseInt(result.rows[0].pending),
      confirmed: parseInt(result.rows[0].confirmed),
      rejected:  parseInt(result.rows[0].rejected),
      completed: parseInt(result.rows[0].completed),
      cancelled: parseInt(result.rows[0].cancelled)
    },
    tableOverview: tableResult.rows.map(r => ({
      name:  r.name,
      total: parseInt(r.total)
    })),
    recentReservations: recentResult.rows
  }
}

module.exports = { create, getAll, getById, updateStatus, cancel, getStats }