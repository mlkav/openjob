/**
 * Repository tabel `authentications` (refresh token).
 * Refresh token wajib terdaftar di database selain harus memiliki signature
 * yang valid, sehingga dapat dicabut saat user melakukan logout.
 */
const pool = require('../db/pool');
const generateId = require('../utils/id');

/**
 * Menyimpan refresh token yang baru diterbitkan.
 *
 * @param {object} payload
 * @param {string} payload.userId
 * @param {string} payload.token
 * @returns {Promise<string>} id authentication
 */
const addRefreshToken = async ({ userId, token }) => {
  const id = generateId();

  const result = await pool.query(
    `INSERT INTO authentications (id, user_id, token)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [id, userId, token],
  );

  return result.rows[0].id;
};

/**
 * Memeriksa apakah refresh token terdaftar di database.
 *
 * @param {string} token
 * @returns {Promise<boolean>}
 */
const verifyRefreshToken = async (token) => {
  const result = await pool.query(
    'SELECT id FROM authentications WHERE token = $1',
    [token],
  );

  return result.rowCount > 0;
};

/**
 * Menghapus refresh token (logout).
 *
 * @param {string} token
 * @returns {Promise<boolean>} true bila token berhasil dihapus
 */
const deleteRefreshToken = async (token) => {
  const result = await pool.query(
    `DELETE FROM authentications
     WHERE token = $1
     RETURNING id`,
    [token],
  );

  return result.rowCount > 0;
};

module.exports = { addRefreshToken, verifyRefreshToken, deleteRefreshToken };
