require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const errorHandler = require('./middlewares/errorHandler')

const app = express()

// ─── Security & parsing ───────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3002',
  credentials: true
}))
app.use(express.json({ limit: '10kb' })) // limit payload size

// ─── Health check ─────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'BookIt API running 🚀',
    environment: process.env.NODE_ENV,
    timestamp: new Date()
  })
})

// ─── Routes ───────────────────────────────────────────────────────
app.use('/api/auth',         require('./modules/auth/auth.routes'))
app.use('/api/table-types',  require('./modules/tableTypes/tableType.routes'))
app.use('/api/tables',       require('./modules/tables/table.routes'))
app.use('/api/reservations', require('./modules/reservations/reservation.routes'))
app.use('/api/users', require('./modules/users/user.routes'))
// ─── 404 ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' })
})

// ─── Global error handler (MUST be last) ─────────────────────────
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 BookIt API running on port ${PORT} [${process.env.NODE_ENV}]`)
})