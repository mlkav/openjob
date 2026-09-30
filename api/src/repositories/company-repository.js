/**
 * Repository tabel `companies`.
 * Relasi: companies.user_id -> users.id (satu user dapat memiliki banyak
 * perusahaan) dan companies -> jobs (one-to-many).
 */
const pool = require('../db/pool');
const generateId = require('../utils/id');

/**
 * Menambahkan perusahaan baru milik seorang user.
 *
 * @param {object} payload
 * @param {string} payload.name
 * @param {string} payload.userId
 * @param {string} payload.location
 * @param {string} payload.description
 * @returns {Promise<string>} id perusahaan
 */
const createCompany = async ({ name, userId, location, description }) => {
  const id = generateId();

  const result = await pool.query(
    `INSERT INTO companies (id, name, user_id, location, description)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [id, name, userId, location, description],
  );

  return result.rows[0].id;
};

/**
 * Mengambil ringkasan seluruh perusahaan.
 *
 * @returns {Promise<Array<object>>}
 */
const getCompanies = async () => {
  const result = await pool.query(
    `SELECT c.id, c.name, c.user_id, c.location, c.description,
            c.created_at
     FROM companies c
     ORDER BY c.name ASC`,
  );

  return result.rows;
};

/**
 * Mengambil satu perusahaan berdasarkan id.
 *
 * @param {string} id
 * @returns {Promise<object|null>}
 */
const getCompanyById = async (id) => {
  const result = await pool.query(
    `SELECT id, name, user_id, location, description, created_at, updated_at
     FROM companies
     WHERE id = $1`,
    [id],
  );

  return result.rows[0] || null;
};

/**
 * Mengubah data perusahaan. Kolom yang tidak dikirim dipertahankan nilainya.
 *
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<object|null>}
 */
const updateCompany = async (id, { name, location, description }) => {
  const result = await pool.query(
    `UPDATE companies
     SET name = COALESCE($2, name),
         location = COALESCE($3, location),
         description = COALESCE($4, description),
         updated_at = current_timestamp
     WHERE id = $1
     RETURNING id, name, location, description`,
    [id, name ?? null, location ?? null, description ?? null],
  );

  return result.rows[0] || null;
};

/**
 * Menghapus perusahaan.
 *
 * @param {string} id
 * @returns {Promise<string|null>} id perusahaan, atau null bila tidak ada
 */
const deleteCompany = async (id) => {
  const result = await pool.query(
    `DELETE FROM companies
     WHERE id = $1
     RETURNING id`,
    [id],
  );

  return result.rows[0] ? result.rows[0].id : null;
};

module.exports = {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
};
