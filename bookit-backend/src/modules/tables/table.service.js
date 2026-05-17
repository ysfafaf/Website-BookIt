const pool = require('../../config/db')

const getAll = async () => {
  const result = await pool.query(
    `SELECT t.id, t.table_number, t.created_at,
            tt.id AS table_type_id, tt.name AS table_type_name
     FROM tables t
     JOIN table_types tt ON tt.id = t.table_type_id
     ORDER BY t.table_number ASC`
  )
  return result.rows
}

const getByType = async (table_type_id) => {
  const result = await pool.query(
    `SELECT t.id, t.table_number,
            tt.id AS table_type_id, tt.name AS table_type_name
     FROM tables t
     JOIN table_types tt ON tt.id = t.table_type_id
     WHERE t.table_type_id = $1
     ORDER BY t.table_number ASC`,
    [table_type_id]
  )
  return result.rows
}

const create = async ({ table_number, table_type_id }) => {
  // Check duplicate table number
  const existing = await pool.query(
    'SELECT id FROM tables WHERE table_number = $1', [table_number]
  )
  if (existing.rows.length > 0) {
    throw { status: 409, message: `Table number ${table_number} already exists.` }
  }

  // Check table type exists
  const typeExists = await pool.query(
    'SELECT id FROM table_types WHERE id = $1', [table_type_id]
  )
  if (typeExists.rows.length === 0) {
    throw { status: 404, message: 'Table type not found.' }
  }

  const result = await pool.query(
    `INSERT INTO tables (table_number, table_type_id)
     VALUES ($1, $2)
     RETURNING *`,
    [table_number, table_type_id]
  )
  return result.rows[0]
}

const remove = async (id) => {
  // Check if table has any active reservations
  const hasReservations = await pool.query(
    `SELECT id FROM reservations
     WHERE table_id = $1
       AND status IN ('pending', 'confirmed')
     LIMIT 1`,
    [id]
  )
  if (hasReservations.rows.length > 0) {
    throw { status: 409, message: 'Cannot delete. Table has active reservations.' }
  }

  const result = await pool.query(
    'DELETE FROM tables WHERE id = $1 RETURNING *', [id]
  )
  if (result.rows.length === 0) {
    throw { status: 404, message: 'Table not found.' }
  }
  return result.rows[0]
}

module.exports = { getAll, getByType, create, remove }