/**
 * Repository tabel `users`.
 * Seluruh query SQL untuk entitas user ditempatkan di layer ini agar service
 * tidak bergantung pada detail database (clean architecture).
 */
const pool = require('../db/pool');
const generateId = require('../utils/id');

/**
 * Menyimpan user baru.
 * Password yang dikirim pada parameter ini diasumsikan sudah di-hash.
 *
 * @param {object} payload
 * @param {string} payload.name
 * @param {string} payload.email
 * @param {string} payload.password password yang sudah di-hash
 * @param {string} [payload.role]
 * @returns {Promise<string>} id user yang baru dibuat
 */
const createUser = async ({ name, email, password, role = 'user' }) => {
  const id = generateId();

  const result = await pool.query(
    `INSERT INTO users (id, name, email, password, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [id, name, email, password, role],
  );

  return result.rows[0].id;
};

/**
 * Mengambil user berdasarkan id tanpa menyertakan password.
 *
 * @param {string} id
 * @returns {Promise<object|null>}
 */
const getUserById = async (id) => {
  const result = await pool.query(
    `SELECT id, name, email, role, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [id],
  );

  return result.rows[0] || null;
};

/**
 * Mengambil user berdasarkan email (termasuk password) untuk keperluan
 * pengecekan duplikasi email dan proses login.
 *
 * @param {string} email
 * @returns {Promise<object|null>}
 */
const getUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT id, name, email, password, role, created_at, updated_at
     FROM users
     WHERE email = $1`,
    [email],
  );

  return result.rows[0] || null;
};

const updateUser = async (id, { name, email, password }) => {
  const result = await pool.query(
    `UPDATE users
     SET name = COALESCE($2, name),
         email = COALESCE($3, email),
         password = COALESCE($4, password),
         updated_at = current_timestamp
     WHERE id = $1
     RETURNING id`,
    [id, name ?? null, email ?? null, password ?? null],
  );

  return result.rows[0] ? result.rows[0].id : null;
};

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
};
