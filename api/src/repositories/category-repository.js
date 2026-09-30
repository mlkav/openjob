/**
 * Repository tabel `categories`.
 * Kategori dinormalisasi ke tabel tersendiri sehingga nama kategori tidak
 * diduplikasi pada setiap baris tabel `jobs`.
 */
const pool = require('../db/pool');
const generateId = require('../utils/id');

/**
 * Menambahkan kategori baru.
 *
 * @param {object} payload
 * @param {string} payload.name
 * @returns {Promise<string>} id kategori
 */
const createCategory = async ({ name }) => {
  const id = generateId();

  const result = await pool.query(
    `INSERT INTO categories (id, name)
     VALUES ($1, $2)
     RETURNING id`,
    [id, name],
  );

  return result.rows[0].id;
};

/**
 * Mengambil seluruh kategori.
 *
 * @returns {Promise<Array<object>>}
 */
const getCategories = async () => {
  const result = await pool.query(
    `SELECT id, name, created_at, updated_at
     FROM categories
     ORDER BY name ASC`,
  );

  return result.rows;
};

/**
 * Mengambil satu kategori berdasarkan id.
 *
 * @param {string} id
 * @returns {Promise<object|null>}
 */
const getCategoryById = async (id) => {
  const result = await pool.query(
    `SELECT id, name, created_at, updated_at
     FROM categories
     WHERE id = $1`,
    [id],
  );

  return result.rows[0] || null;
};

/**
 * Mengubah kategori. Kolom yang tidak dikirim akan dipertahankan nilainya.
 *
 * @param {string} id
 * @param {object} payload
 * @param {string} [payload.name]
 * @returns {Promise<string|null>} id kategori, atau null bila tidak ditemukan
 */
const updateCategory = async (id, { name }) => {
  const result = await pool.query(
    `UPDATE categories
     SET name = COALESCE($2, name),
         updated_at = current_timestamp
     WHERE id = $1
     RETURNING id, name`,
    [id, name ?? null],
  );

  return result.rows[0] || null;
};

/**
 * Menghapus kategori.
 *
 * @param {string} id
 * @returns {Promise<string|null>} id kategori, atau null bila tidak ditemukan
 */
const deleteCategory = async (id) => {
  const result = await pool.query(
    `DELETE FROM categories
     WHERE id = $1
     RETURNING id`,
    [id],
  );

  return result.rows[0] ? result.rows[0].id : null;
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
