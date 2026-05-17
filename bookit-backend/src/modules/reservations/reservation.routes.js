const express = require('express')
const router = express.Router()
const reservationController = require('./reservation.controller')
const { authenticate } = require('../../middlewares/auth')
const { authorize } = require('../../middlewares/role')
const validate = require('../../middlewares/validate')
const { createReservationSchema, updateStatusSchema } = require('./reservation.validation')

router.use(authenticate)

router.post('/',   authorize('customer'), validate(createReservationSchema), reservationController.create)
router.get('/',    reservationController.getAll)
// Admin only — add before /:id routes
router.get('/stats', authorize('admin'), reservationController.getStats)
router.get('/:id', reservationController.getById)

router.patch('/:id/cancel', authorize('customer'),          reservationController.cancel)
router.patch('/:id/status', authorize('admin', 'staff'),
  validate(updateStatusSchema), reservationController.updateStatus)

module.exports = router