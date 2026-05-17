const pool = require('../../config/db')

const getAll = async () => {
  const result = await pool.query(
    'SELECT * FROM table_types ORDER BY name ASC'
  )
  return result.rows
}

const getAvailable = async ({ date, time }) => {
  // Returns table types that still have at least one free table
  // at the requested date & time
  const result = await pool.query(
    `SELECT DISTINCT tt.id, tt.name
     FROM table_types tt
     JOIN tables t ON t.table_type_id = tt.id
     WHERE t.id NOT IN (
       SELECT r.table_id
       FROM reservations r
       WHERE r.date = $1
         AND r.time = $2
         AND r.status NOT IN ('rejected', 'cancelled')
     )
     ORDER BY tt.name ASC`,
    [date, time]
  )
  return result.rows
}

const create = async ({ name }) => {
  const existing = await pool.query(
    'SELECT id FROM table_types WHERE name = $1', [name]
  )
  if (existing.rows.length > 0) {
    throw { status: 409, message: 'Table type already exists.' }
  }

  const result = await pool.query(
    `INSERT INTO table_types (name)
     VALUES ($1)
     RETURNING *`,
    [name]
  )
  return result.rows[0]
}

const remove = async (id) => {
  // Check if any table uses this type
  const inUse = await pool.query(
    'SELECT id FROM tables WHERE table_type_id = $1 LIMIT 1', [id]
  )
  if (inUse.rows.length > 0) {
    throw { status: 409, message: 'Cannot delete. Tables are using this type.' }
  }

  const result = await pool.query(
    'DELETE FROM table_types WHERE id = $1 RETURNING *', [id]
  )
  if (result.rows.length === 0) {
    throw { status: 404, message: 'Table type not found.' }
  }
  return result.rows[0]
}

module.exports = { getAll, getAvailable, create, remove }