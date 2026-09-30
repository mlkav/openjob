/**
 * Repository tabel `jobs`.
 * Relasi: jobs.company_id -> companies.id dan jobs.category_id -> categories.id.
 * Nama perusahaan serta nama kategori diambil melalui JOIN (bukan diduplikasi)
 * sehingga konsisten dengan hasil normalisasi database.
 */
const pool = require('../db/pool');
const generateId = require('../utils/id');

/**
 * Potongan query SELECT standar untuk entitas job beserta data relasinya.
 * Query pencarian selalu membutuhkan `company_name`, karenanya perusahaan dan
 * kategori selalu di-JOIN.
 */
const JOB_QUERY = `
  SELECT j.id, j.company_id, j.category_id, j.title, j.description,
         j.job_type, j.experience_level, j.location_type, j.location_city,
         j.salary_min, j.salary_max, j.is_salary_visible, j.status,
         j.created_at, j.updated_at,
         c.name AS company_name,
         c.location AS company_location,
         cat.name AS category_name
  FROM jobs j
  JOIN companies c ON c.id = j.company_id
  JOIN categories cat ON cat.id = j.category_id
`;

const JOB_LIST_QUERY = `
  SELECT j.id, j.category_id, j.title, j.description, j.job_type,
         j.experience_level, j.location_type, j.location_city,
         j.salary_min, j.salary_max, j.is_salary_visible, j.status,
         c.name AS company_name
  FROM jobs j
  JOIN companies c ON c.id = j.company_id
  JOIN categories cat ON cat.id = j.category_id
`;

/**
 * Menambahkan lowongan kerja baru.
 *
 * @param {object} payload
 * @param {string} payload.companyId
 * @param {string} payload.categoryId
 * @param {string} payload.title
 * @param {string} payload.description
 * @param {string} payload.jobType
 * @param {string} payload.experienceLevel
 * @param {string} payload.locationType
 * @param {string} [payload.locationCity]
 * @param {number} [payload.salaryMin]
 * @param {number} [payload.salaryMax]
 * @param {boolean} [payload.isSalaryVisible]
 * @param {string} [payload.status]
 * @returns {Promise<string>} id job
 */
const createJob = async ({
  companyId,
  categoryId,
  title,
  description,
  jobType,
  experienceLevel,
  locationType,
  locationCity,
  salaryMin,
  salaryMax,
  isSalaryVisible = false,
  status = 'open',
}) => {
  const id = generateId();

  const result = await pool.query(
    `INSERT INTO jobs (
       id, company_id, category_id, title, description, job_type,
       experience_level, location_type, location_city, salary_min, salary_max,
       is_salary_visible, status
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING id`,
    [
      id,
      companyId,
      categoryId,
      title,
      description,
      jobType,
      experienceLevel,
      locationType,
      locationCity ?? null,
      salaryMin ?? null,
      salaryMax ?? null,
      isSalaryVisible,
      status,
    ],
  );

  return result.rows[0].id;
};

/**
 * Mengambil daftar job. Query parameter yang kosong/null dianggap tanpa filter.
 *
 * @param {object} [filter]
 * @param {string} [filter.title] pencarian judul job (partial, case-insensitive)
 * @param {string} [filter.companyName] pencarian nama perusahaan
 * @returns {Promise<Array<object>>}
 */
const getJobs = async ({ title = null, companyName = null } = {}) => {
  const result = await pool.query(
    `${JOB_LIST_QUERY}
     WHERE ($1::text IS NULL OR j.title ILIKE '%' || $1 || '%')
       AND ($2::text IS NULL OR c.name ILIKE '%' || $2 || '%')
     ORDER BY j.created_at DESC, j.title ASC`,
    [title || null, companyName || null],
  );

  return result.rows;
};

/**
 * Mengambil satu job berdasarkan id.
 *
 * @param {string} id
 * @returns {Promise<object|null>}
 */
const getJobById = async (id) => {
  const result = await pool.query(
    `${JOB_QUERY}
     WHERE j.id = $1`,
    [id],
  );

  return result.rows[0] || null;
};

/**
 * Mengambil seluruh job milik satu perusahaan.
 * Id yang tidak terdaftar menghasilkan array kosong (bukan 404).
 *
 * @param {string} companyId
 * @returns {Promise<Array<object>>}
 */
const getJobsByCompanyId = async (companyId) => {
  const result = await pool.query(
    `${JOB_QUERY}
     WHERE j.company_id = $1
     ORDER BY j.created_at DESC, j.title ASC`,
    [companyId],
  );

  return result.rows;
};

/**
 * Mengambil seluruh job pada satu kategori.
 *
 * @param {string} categoryId
 * @returns {Promise<Array<object>>}
 */
const getJobsByCategoryId = async (categoryId) => {
  const result = await pool.query(
    `${JOB_QUERY}
     WHERE j.category_id = $1
     ORDER BY j.created_at DESC, j.title ASC`,
    [categoryId],
  );

  return result.rows;
};

/**
 * Mengubah job. Kolom yang tidak dikirim akan dipertahankan nilainya.
 *
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<string|null>} id job, atau null bila tidak ditemukan
 */
const updateJob = async (
  id,
  {
    companyId,
    categoryId,
    title,
    description,
    jobType,
    experienceLevel,
    locationType,
    locationCity,
    salaryMin,
    salaryMax,
    isSalaryVisible,
    status,
  },
) => {
  const result = await pool.query(
    `UPDATE jobs
     SET company_id = COALESCE($2, company_id),
         category_id = COALESCE($3, category_id),
         title = COALESCE($4, title),
         description = COALESCE($5, description),
         job_type = COALESCE($6, job_type),
         experience_level = COALESCE($7, experience_level),
         location_type = COALESCE($8, location_type),
         location_city = COALESCE($9, location_city),
         salary_min = COALESCE($10, salary_min),
         salary_max = COALESCE($11, salary_max),
         is_salary_visible = COALESCE($12, is_salary_visible),
         status = COALESCE($13, status),
         updated_at = current_timestamp
     WHERE id = $1
     RETURNING id`,
    [
      id,
      companyId ?? null,
      categoryId ?? null,
      title ?? null,
      description ?? null,
      jobType ?? null,
      experienceLevel ?? null,
      locationType ?? null,
      locationCity ?? null,
      salaryMin ?? null,
      salaryMax ?? null,
      isSalaryVisible ?? null,
      status ?? null,
    ],
  );

  return result.rows[0] ? result.rows[0].id : null;
};

/**
 * Menghapus job.
 *
 * @param {string} id
 * @returns {Promise<string|null>} id job, atau null bila tidak ditemukan
 */
const deleteJob = async (id) => {
  const result = await pool.query(
    `DELETE FROM jobs
     WHERE id = $1
     RETURNING id`,
    [id],
  );

  return result.rows[0] ? result.rows[0].id : null;
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  getJobsByCompanyId,
  getJobsByCategoryId,
  updateJob,
  deleteJob,
};
