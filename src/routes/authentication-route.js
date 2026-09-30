/**
 * Route resource `authentications`.
 * POST (login) dan PUT (refresh) bersifat publik, sedangkan DELETE (logout)
 * membutuhkan access token.
 */
const express = require('express');
const authenticate = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  loginPayloadSchema,
  refreshTokenPayloadSchema,
} = require('../validators/authentication-validator');
const authenticationController = require('../controllers/authentication-controller');

const router = express.Router();

router.post('/', validate(loginPayloadSchema), authenticationController.login);
router.put('/', validate(refreshTokenPayloadSchema), authenticationController.refreshAuthentication);
router.delete(
  '/',
  authenticate,
  validate(refreshTokenPayloadSchema),
  authenticationController.deleteAuthentication,
);

module.exports = router;