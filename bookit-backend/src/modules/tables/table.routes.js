const express = require('express')
const router = express.Router()
const tableController = require('./table.controller')
const { authenticate } = require('../../middlewares/auth')
const { authorize } = require('../../middlewares/role')
const validate = require('../../middlewares/validate')
const { createTableSchema } = require('./table.validation')

router.use(authenticate)

router.get('/',               authorize('admin', 'staff'), tableController.getAll)
router.get('/by-type/:typeId',authorize('admin', 'staff'), tableController.getByType)
router.post('/',  authorize('admin'), validate(createTableSchema), tableController.create)
router.delete('/:id', authorize('admin'), tableController.remove)

module.exports = router