/**
 * Repository tabel `bookmarks`.
 * Tabel ini menormalisasi relasi many-to-many antara users dan jobs sehingga
 * satu user dapat menyimpan banyak lowongan (dan sebaliknya).
 */
const pool = require('../db/pool');
const generateId = require('../utils/id');

const BOOKMARK_QUERY = `
  SELECT b.id, b.user_id, b.job_id, b.created_at, b.updated_at,
         j.title AS job_title,
         j.status AS job_status,
         j.location_city,
         j.job_type,
         c.name AS company_name
  FROM bookmarks b
  JOIN jobs j ON j.id = b.job_id
  JOIN companies c ON c.id = j.company_id
`;

/**
 * Menyimpan lowongan ke daftar bookmark seorang user.
 *
 * @param {object} payload
 * @param {string} payload.userId
 * @param {string} payload.jobId
 * @returns {Promise<string>} id bookmark
 */
const createBookmark = async ({ userId, jobId }) => {
  const id = generateId();

  const result = await pool.query(
    `INSERT INTO bookmarks (id, user_id, job_id)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [id, userId, jobId],
  );

  return result.rows[0].id;
};

/**
 * Mengambil seluruh bookmark milik satu user.
 *
 * @param {string} userId
 * @returns {Promise<Array<object>>}
 */
const getBookmarksByUserId = async (userId) => {
  const result = await pool.query(
    `${BOOKMARK_QUERY}
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [userId],
  );

  return result.rows;
};

/**
 * Mengambil satu bookmark berdasarkan id.
 *
 * @param {string} id
 * @returns {Promise<object|null>}
 */
const getBookmarkById = async (id) => {
  const result = await pool.query(
    `${BOOKMARK_QUERY}
     WHERE b.id = $1`,
    [id],
  );

  return result.rows[0] || null;
};

/**
 * Menghapus bookmark berdasarkan pasangan user dan lowongan.
 *
 * @param {string} userId
 * @param {string} jobId
 * @returns {Promise<string|null>} id bookmark, atau null bila tidak ada
 */
const deleteBookmarkByUserAndJob = async (userId, jobId) => {
  const result = await pool.query(
    `DELETE FROM bookmarks
     WHERE user_id = $1 AND job_id = $2
     RETURNING id`,
    [userId, jobId],
  );

  return result.rows[0] ? result.rows[0].id : null;
};

module.exports = {
  createBookmark,
  getBookmarksByUserId,
  getBookmarkById,
  deleteBookmarkByUserAndJob,
};