const pool = require('../../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const register = async ({ name, email, password, phone_number }) => {
  // 1. Check if email already exists
  const existing = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  )

  if (existing.rows.length > 0) {
    throw { status: 409, message: 'Email already registered.' }
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // 3. Insert user (role defaults to 'customer' in DB)
  const result = await pool.query(
    `INSERT INTO users (name, email, password, phone_number)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, phone_number, role, created_at`,
    [name, email, hashedPassword, phone_number || null]
  )

  return result.rows[0]
}

const login = async ({ email, password }) => {
  // 1. Find user by email
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  )

  const user = result.rows[0]

  if (!user) {
    throw { status: 401, message: 'Invalid email or password.' }
  }

  // 2. Compare password
  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    throw { status: 401, message: 'Invalid email or password.' }
  }

  // 3. Generate JWT
  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role
    }
  }
}

module.exports = { register, login }