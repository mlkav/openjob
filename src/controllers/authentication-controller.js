/**
 * Controller resource `authentications`.
 */
const authenticationService = require('../services/authentication-service');
const { sendSuccess } = require('../utils/response');

/** POST /authentications */
const login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = await authenticationService.login(req.body);

    return sendSuccess(res, {
      data: { accessToken, refreshToken },
      message: 'Login berhasil',
    });
  } catch (error) {
    return next(error);
  }
};

/** PUT /authentications */
const refreshAuthentication = async (req, res, next) => {
  try {
    const { accessToken } = await authenticationService.refreshAuthentication(req.body.refreshToken);

    return sendSuccess(res, {
      data: { accessToken },
      message: 'Access token berhasil diperbarui',
    });
  } catch (error) {
    return next(error);
  }
};

/** DELETE /authentications */
const deleteAuthentication = async (req, res, next) => {
  try {
    await authenticationService.deleteAuthentication(req.body.refreshToken);

    return sendSuccess(res, { message: 'Refresh token berhasil dihapus' });
  } catch (error) {
    return next(error);
  }
};

module.exports = { login, refreshAuthentication, deleteAuthentication };