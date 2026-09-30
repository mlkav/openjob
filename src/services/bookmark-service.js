/**
 * Service bookmark.
 * Bookmark selalu terikat pada user yang sedang login sehingga relasi
 * many-to-many antara users dan jobs tetap konsisten.
 */
const bookmarkRepository = require('../repositories/bookmark-repository');
const jobRepository = require('../repositories/job-repository');
const { NotFoundError } = require('../utils/errors');

/**
 * Menambahkan bookmark untuk sebuah lowongan.
 *
 * @param {string} userId id user yang sedang login
 * @param {string} jobId
 * @returns {Promise<string>} id bookmark
 * @throws {NotFoundError} bila lowongan tidak ditemukan
 */
const addBookmark = async (userId, jobId) => {
  const job = await jobRepository.getJobById(jobId);

  if (!job) {
    throw new NotFoundError('Lowongan tidak ditemukan');
  }

  // Duplikasi bookmark dijaga oleh UNIQUE constraint (bookmarks_user_job_unique).
  return bookmarkRepository.createBookmark({ userId, jobId });
};

/**
 * Mengambil seluruh bookmark milik user yang sedang login.
 *
 * @param {string} userId
 * @returns {Promise<Array<object>>}
 */
const getBookmarksByUserId = async (userId) => bookmarkRepository.getBookmarksByUserId(userId);

/**
 * Mengambil satu bookmark milik user pada sebuah lowongan.
 *
 * @param {string} id
 * @param {string} jobId
 * @param {string} userId
 * @returns {Promise<object>}
 * @throws {NotFoundError} bila bookmark tidak ditemukan/bukan milik user
 */
const getBookmarkByIdAndUser = async (id, jobId, userId) => {
  const bookmark = await bookmarkRepository.getBookmarkById(id);

  // Bookmark milik user lain diperlakukan sebagai tidak ditemukan.
  if (!bookmark || bookmark.job_id !== jobId || bookmark.user_id !== userId) {
    throw new NotFoundError('Bookmark tidak ditemukan');
  }

  return bookmark;
};

/**
 * Menghapus bookmark berdasarkan lowongan.
 *
 * @param {string} userId
 * @param {string} jobId
 * @returns {Promise<void>}
 * @throws {NotFoundError} bila bookmark tidak ditemukan
 */
const deleteBookmark = async (userId, jobId) => {
  const deletedId = await bookmarkRepository.deleteBookmarkByUserAndJob(userId, jobId);

  if (!deletedId) {
    throw new NotFoundError('Bookmark tidak ditemukan');
  }
};

module.exports = {
  addBookmark,
  getBookmarksByUserId,
  getBookmarkByIdAndUser,
  deleteBookmark,
};