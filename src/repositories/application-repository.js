/**
 * Repository tabel `applications`.
 * Relasi: applications.user_id -> users.id dan applications.job_id -> jobs.id.
 * Data pelamar dan lowongan diambil lewat JOIN agar response tetap informatif.
 */
const pool = require('../db/pool');
const generateId = require('../utils/id');

const APPLICATION_QUERY = `
  SELECT a.id, a.user_id, a.job_id, a.status, a.created_at, a.updated_at,
         u.name AS user_name,
         u.email AS user_email,
         j.title AS job_title,
         j.company_id,
         c.name AS company_name
  FROM applications a
  JOIN users u ON u.id = a.user_id
  JOIN jobs j ON j.id = a.job_id
  JOIN companies c ON c.id = j.company_id
`;

/**
 * Menyimpan lamaran kerja baru.
 *
 * @param {object} payload
 * @param {string} payload.userId
 * @param {string} payload.jobId
 * @param {string} [payload.status]
 * @returns {Promise<string>} id application
 */
const createApplication = async ({ userId, jobId, status = 'pending' }) => {
  const id = generateId();

  const result = await pool.query(
    `INSERT INTO applications (id, user_id, job_id, status)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [id, userId, jobId, status],
  );

  return result.rows[0].id;
};

/**
 * Mengambil seluruh lamaran kerja.
 *
 * @returns {Promise<Array<object>>}
 */
const getApplications = async () => {
  const result = await pool.query(`${APPLICATION_QUERY}
     ORDER BY a.created_at DESC`);

  return result.rows;
};

/**
 * Mengambil satu lamaran kerja berdasarkan id.
 *
 * @param {string} id
 * @returns {Promise<object|null>}
 */
const getApplicationById = async (id) => {
  const result = await pool.query(`${APPLICATION_QUERY}
     WHERE a.id = $1`, [id]);

  return result.rows[0] || null;
};

/**
 * Mengambil lamaran kerja milik satu user.
 *
 * @param {string} userId
 * @returns {Promise<Array<object>>}
 */
const getApplicationsByUserId = async (userId) => {
  const result = await pool.query(
    `${APPLICATION_QUERY}
     WHERE a.user_id = $1
     ORDER BY a.created_at DESC`,
    [userId],
  );

  return result.rows;
};

/**
 * Mengambil lamaran kerja pada satu lowongan.
 *
 * @param {string} jobId
 * @returns {Promise<Array<object>>}
 */
const getApplicationsByJobId = async (jobId) => {
  const result = await pool.query(
    `${APPLICATION_QUERY}
     WHERE a.job_id = $1
     ORDER BY a.created_at DESC`,
    [jobId],
  );

  return result.rows;
};

/**
 * Mengubah status lamaran kerja.
 *
 * @param {string} id
 * @param {string} status
 * @returns {Promise<string|null>} id application, atau null bila tidak ada
 */
const updateApplicationStatus = async (id, status) => {
  const result = await pool.query(
    `UPDATE applications
     SET status = $2,
         updated_at = current_timestamp
     WHERE id = $1
     RETURNING id`,
    [id, status],
  );

  return result.rows[0] ? result.rows[0].id : null;
};

/**
 * Menghapus lamaran kerja.
 *
 * @param {string} id
 * @returns {Promise<string|null>} id application, atau null bila tidak ada
 */
const deleteApplication = async (id) => {
  const result = await pool.query(
    `DELETE FROM applications
     WHERE id = $1
     RETURNING id`,
    [id],
  );

  return result.rows[0] ? result.rows[0].id : null;
};

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  getApplicationsByUserId,
  getApplicationsByJobId,
  updateApplicationStatus,
  deleteApplication,
};