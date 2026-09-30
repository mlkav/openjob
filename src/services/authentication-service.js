/**
 * Service autentikasi.
 * Mengelola login, penerbitan access/refresh token, refresh token, dan logout.
 * Refresh token wajib terdaftar di database agar dapat dicabut saat logout.
 */
const authenticationRepository = require('../repositories/authentication-repository');
const userRepository = require('../repositories/user-repository');
const { comparePassword } = require('../utils/password');
const { createAccessToken, createRefreshToken, verifyRefreshToken } = require('../utils/token');
const { AuthenticationError, InvariantError } = require('../utils/errors');

/**
 * Proses login user.
 *
 * @param {object} payload
 * @param {string} payload.email
 * @param {string} payload.password
 * @returns {Promise<{accessToken: string, refreshToken: string}>}
 * @throws {AuthenticationError} bila email tidak terdaftar atau password salah
 */
const login = async ({ email, password }) => {
  const user = await userRepository.getUserByEmail(email);

  // Pesan error disamakan agar tidak membocorkan email mana yang terdaftar.
  if (!user) {
    throw new AuthenticationError('Kredensial yang Anda berikan salah');
  }

  const isPasswordMatch = await comparePassword(password, user.password);

  if (!isPasswordMatch) {
    throw new AuthenticationError('Kredensial yang Anda berikan salah');
  }

  const accessToken = createAccessToken({ id: user.id, role: user.role });
  const refreshToken = createRefreshToken({ id: user.id });

  await authenticationRepository.addRefreshToken({
    userId: user.id,
    token: refreshToken,
  });

  return { accessToken, refreshToken };
};

/**
 * Menerbitkan access token baru dari refresh token yang valid & terdaftar.
 *
 * @param {string} refreshToken
 * @returns {Promise<{accessToken: string}>}
 * @throws {InvariantError} bila signature tidak valid atau token tidak terdaftar
 */
const refreshAuthentication = async (refreshToken) => {
  const payload = verifyRefreshToken(refreshToken);
  const isRegistered = await authenticationRepository.verifyRefreshToken(refreshToken);

  if (!isRegistered) {
    throw new InvariantError('Refresh token tidak terdaftar');
  }

  const user = await userRepository.getUserById(payload.id);

  if (!user) {
    throw new InvariantError('Refresh token tidak valid');
  }

  return { accessToken: createAccessToken({ id: user.id, role: user.role }) };
};

/**
 * Logout: menghapus refresh token dari database sehingga tidak dapat dipakai lagi.
 *
 * @param {string} refreshToken
 * @returns {Promise<void>}
 * @throws {InvariantError} bila signature tidak valid atau token tidak terdaftar
 */
const deleteAuthentication = async (refreshToken) => {
  verifyRefreshToken(refreshToken);

  const isDeleted = await authenticationRepository.deleteRefreshToken(refreshToken);

  if (!isDeleted) {
    throw new InvariantError('Refresh token tidak ditemukan');
  }
};

module.exports = { login, refreshAuthentication, deleteAuthentication };