/**
 * Utilitas pembuatan dan verifikasi JWT.
 * Secret key diambil dari environment variable ACCESS_TOKEN_KEY dan
 * REFRESH_TOKEN_KEY (tidak di-hardcode).
 */
const jwt = require('jsonwebtoken');
const config = require('../config');
const { AuthenticationError, InvariantError } = require('./errors');

/**
 * Membuat access token. Payload berisi id user (dan role) dengan masa berlaku
 * sesuai ACCESS_TOKEN_AGE (default 3 jam).
 *
 * @param {object} payload
 * @param {string} payload.id
 * @param {string} [payload.role]
 * @returns {string}
 */
const createAccessToken = ({ id, role }) =>
  jwt.sign({ id, role }, config.jwt.accessTokenKey, { expiresIn: config.jwt.accessTokenAge });

/**
 * Membuat refresh token. Payload hanya berisi id user.
 *
 * @param {object} payload
 * @param {string} payload.id
 * @returns {string}
 */
const createRefreshToken = ({ id }) => jwt.sign({ id }, config.jwt.refreshTokenKey);

/**
 * Memverifikasi access token.
 *
 * @param {string} token
 * @returns {object} payload token
 * @throws {AuthenticationError} bila signature/expiry token tidak valid
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.accessTokenKey);
  } catch {
    throw new AuthenticationError('Access token tidak valid');
  }
};

/**
 * Memverifikasi refresh token.
 *
 * @param {string} token
 * @returns {object} payload token
 * @throws {InvariantError} bila signature token tidak valid
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.refreshTokenKey);
  } catch {
    throw new InvariantError('Refresh token tidak valid');
  }
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};