const express = require('express')
const router = express.Router()
const tableTypeController = require('./tableType.controller')
const { authenticate } = require('../../middlewares/auth')
const { authorize } = require('../../middlewares/role')
const validate = require('../../middlewares/validate')
const { createTableTypeSchema } = require('./tableType.validation')

router.use(authenticate)

router.get('/',           tableTypeController.getAll)
router.get('/available',  tableTypeController.getAvailable)
router.post('/',  authorize('admin'), validate(createTableTypeSchema), tableTypeController.create)
router.delete('/:id', authorize('admin'), tableTypeController.remove)

module.exports = router