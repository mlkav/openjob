/**
 * Route resource `users`.
 */
const express = require('express');
const authenticate = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  userPayloadSchema,
  updateUserPayloadSchema,
} = require('../validators/user-validator');
const userController = require('../controllers/user-controller');

const router = express.Router();

// Endpoint publik: registrasi & detail user.
router.post('/', validate(userPayloadSchema), userController.createUser);
router.get('/:id', userController.getUserById);
router.put(
  '/:id',
  authenticate,
  validate(updateUserPayloadSchema),
  userController.editUserById,
);

module.exports = router;
