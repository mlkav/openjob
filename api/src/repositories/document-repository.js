/**
 * Repository dokumen.
 * Menjalankan operasi baca dan tulis tabel `documents` melalui connection pool.
 */
const pool = require('../db/pool');
const generateId = require('../utils/id');

/**
 * Membuat catatan dokumen PDF.
 *
 * @param {object} document data dokumen yang akan disimpan
 * @param {string} document.userId id pemilik dokumen
 * @param {string} document.filename nama berkas di penyimpanan
 * @param {string} document.originalName nama asli berkas
 * @param {number} document.size ukuran berkas dalam byte
 * @returns {Promise<string>} id dokumen yang dibuat
 */
const createDocument = async ({ userId, filename, originalName, size }) => {
  const id = generateId();
  await pool.query(
    `INSERT INTO documents (id, user_id, filename, original_name, size, mime_type)
     VALUES ($1, $2, $3, $4, $5, 'application/pdf')`,
    [id, userId, filename, originalName, size],
  );

  return id;
};

/**
 * Mengambil seluruh dokumen, diurutkan dari yang terbaru.
 *
 * @returns {Promise<Array<object>>}
 */
const getDocuments = async () => {
  const result = await pool.query(
    `SELECT id, filename, original_name AS "originalName", size,
            mime_type AS "mimeType", created_at
     FROM documents
     ORDER BY created_at DESC`,
  );

  return result.rows;
};

/**
 * Mengambil dokumen berdasarkan id.
 *
 * @param {string} id id dokumen
 * @returns {Promise<object|null>} dokumen atau `null` bila tidak ditemukan
 */
const getDocumentById = async (id) => {
  const result = await pool.query(
    `SELECT id, user_id, filename, original_name, size, mime_type, created_at
     FROM documents WHERE id = $1`,
    [id],
  );

  return result.rows[0] || null;
};

/**
 * Menghapus catatan dokumen berdasarkan id.
 *
 * @param {string} id id dokumen
 * @returns {Promise<string|null>} id dokumen yang dihapus atau `null`
 */
const deleteDocument = async (id) => {
  const result = await pool.query(
    'DELETE FROM documents WHERE id = $1 RETURNING id',
    [id],
  );

  return result.rows[0] ? result.rows[0].id : null;
};

module.exports = {
  createDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
};
