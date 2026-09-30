/**
 * Service profile.
 * Menyediakan data profil serta daftar lamaran dan bookmark milik user yang
 * sedang login (data selalu difilter berdasarkan id dari access token).
 */
const userRepository = require('../repositories/user-repository');
const applicationRepository = require('../repositories/application-repository');
const bookmarkRepository = require('../repositories/bookmark-repository');
const { NotFoundError } = require('../utils/errors');

/**
 * Mengambil profil user yang sedang login.
 *
 * @param {string} userId
 * @returns {Promise<object>}
 * @throws {NotFoundError} bila user tidak ditemukan
 */
const getProfile = async (userId) => {
  const user = await userRepository.getUserById(userId);

  if (!user) {
    throw new NotFoundError('User tidak ditemukan');
  }

  return user;
};

/**
 * Mengambil daftar lamaran pekerjaan milik user yang sedang login.
 *
 * @param {string} userId
 * @returns {Promise<Array<object>>}
 */
const getProfileApplications = async (userId) =>
  applicationRepository.getProfileApplicationsByUserId(userId);

/**
 * Mengambil daftar bookmark milik user yang sedang login.
 *
 * @param {string} userId
 * @returns {Promise<Array<object>>}
 */
const getProfileBookmarks = async (userId) =>
  bookmarkRepository.getBookmarksByUserId(userId);

module.exports = { getProfile, getProfileApplications, getProfileBookmarks };
