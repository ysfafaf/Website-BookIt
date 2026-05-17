const express = require('express')
const router = express.Router()
const userController = require('./user.controller')
const { authenticate } = require('../../middlewares/auth')
const { authorize } = require('../../middlewares/role')

router.use(authenticate)
router.use(authorize('admin'))

router.get('/',           userController.getAll)
router.patch('/:id/role', userController.updateRole)
router.delete('/:id',     userController.remove)

module.exports = router