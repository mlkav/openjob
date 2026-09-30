/**
 * Middleware autentikasi.
 * Memvalidasi header `Authorization: Bearer <access_token>`, kemudian
 * menyimpan identitas user pada `req.user` agar dapat dipakai layer berikutnya
 * (otorisasi kepemilikan data).
 */
const { AuthenticationError } = require('../utils/errors');
const { verifyAccessToken } = require('../utils/token');

const authenticate = (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (
      !authorizationHeader
      || !authorizationHeader.startsWith('Bearer ')
      || authorizationHeader.split(' ').length !== 2
    ) {
      throw new AuthenticationError('Missing authentication');
    }

    const [, accessToken] = authorizationHeader.split(' ');
    const payload = verifyAccessToken(accessToken);

    // Payload JWT selalu mengandung id user yang sedang login.
    req.user = { id: payload.id, role: payload.role };

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = authenticate;