/**
 * Route resource `users`.
 */
const express = require('express');
const validate = require('../middlewares/validate');
const { userPayloadSchema } = require('../validators/user-validator');
const userController = require('../controllers/user-controller');

const router = express.Router();

// Endpoint publik: registrasi & detail user.
router.post('/', validate(userPayloadSchema), userController.createUser);
router.get('/:id', userController.getUserById);

module.exports = router;