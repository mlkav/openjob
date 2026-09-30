/**
 * Service lowongan kerja.
 * Menangani CRUD, pencarian (query parameter), serta otorisasi pemilik
 * perusahaan atas lowongan yang dikelola (clean architecture: layer ini hanya
 * berkomunikasi dengan repository).
 */
const jobRepository = require('../repositories/job-repository');
const companyRepository = require('../repositories/company-repository');
const categoryRepository = require('../repositories/category-repository');
const { verifyOwnership } = require('../utils/authorization');
const { NotFoundError } = require('../utils/errors');

/**
 * Memastikan kategori yang direferensikan benar-benar ada.
 *
 * @param {string} categoryId
 * @returns {Promise<object>}
 * @throws {NotFoundError} bila kategori tidak ditemukan
 */
const verifyCategoryExists = async (categoryId) => {
  const category = await categoryRepository.getCategoryById(categoryId);

  if (!category) {
    throw new NotFoundError('Kategori tidak ditemukan');
  }

  return category;
};

/**
 * Memastikan aktor berhak mengelola lowongan pada sebuah perusahaan
 * (hanya pemilik perusahaan atau admin).
 *
 * @param {string} companyId
 * @param {object} actor user yang sedang login
 * @returns {Promise<object>} data perusahaan
 * @throws {NotFoundError|AuthorizationError}
 */
const verifyCompanyAccess = async (companyId, actor) => {
  const company = await companyRepository.getCompanyById(companyId);

  if (!company) {
    throw new NotFoundError('Perusahaan tidak ditemukan');
  }

  verifyOwnership(
    company.user_id,
    actor,
    'Anda tidak berhak mengelola lowongan pada perusahaan ini',
  );

  return company;
};

/**
 * Memetakan payload (snake_case dari client) menjadi parameter repository.
 *
 * @param {object} payload
 * @returns {object}
 */
const mapJobPayload = (payload) => ({
  companyId: payload.company_id,
  categoryId: payload.category_id,
  title: payload.title,
  description: payload.description,
  jobType: payload.job_type,
  experienceLevel: payload.experience_level,
  locationType: payload.location_type,
  locationCity: payload.location_city,
  salaryMin: payload.salary_min,
  salaryMax: payload.salary_max,
  isSalaryVisible: payload.is_salary_visible,
  status: payload.status,
});

/**
 * Menambahkan lowongan kerja baru.
 *
 * @param {object} actor user yang sedang login
 * @param {object} payload payload yang sudah divalidasi Joi
 * @returns {Promise<string>} id job
 */
const addJob = async (actor, payload) => {
  await verifyCompanyAccess(payload.company_id, actor);
  await verifyCategoryExists(payload.category_id);

  return jobRepository.createJob(mapJobPayload(payload));
};

/**
 * Mengambil daftar lowongan, mendukung pencarian `?title` dan `?company-name`.
 *
 * @param {object} [filter]
 * @param {string} [filter.title]
 * @param {string} [filter.companyName]
 * @returns {Promise<Array<object>>}
 */
const getJobs = async ({ title, companyName } = {}) => jobRepository.getJobs({ title, companyName });

/**
 * Mengambil satu lowongan berdasarkan id.
 *
 * @param {string} id
 * @returns {Promise<object>}
 * @throws {NotFoundError} bila lowongan tidak ditemukan
 */
const getJobById = async (id) => {
  const job = await jobRepository.getJobById(id);

  if (!job) {
    throw new NotFoundError('Lowongan tidak ditemukan');
  }

  return job;
};

/**
 * Mengambil lowongan berdasarkan perusahaan.
 * Id yang tidak terdaftar tetap menghasilkan array kosong.
 *
 * @param {string} companyId
 * @returns {Promise<Array<object>>}
 */
const getJobsByCompanyId = async (companyId) => jobRepository.getJobsByCompanyId(companyId);

/**
 * Mengambil lowongan berdasarkan kategori.
 *
 * @param {string} categoryId
 * @returns {Promise<Array<object>>}
 */
const getJobsByCategoryId = async (categoryId) => jobRepository.getJobsByCategoryId(categoryId);

/**
 * Mengubah lowongan kerja.
 *
 * @param {string} id
 * @param {object} payload
 * @param {object} actor user yang sedang login
 * @returns {Promise<void>}
 */
const editJobById = async (id, payload, actor) => {
  const job = await getJobById(id);

  // Aktor harus berhak atas lowongan saat ini.
  await verifyCompanyAccess(job.company_id, actor);

  // Bila lowongan dipindah ke perusahaan lain, aktor juga harus berhak atas
  // perusahaan tujuan tersebut.
  if (payload.company_id && payload.company_id !== job.company_id) {
    await verifyCompanyAccess(payload.company_id, actor);
  }

  if (payload.category_id) {
    await verifyCategoryExists(payload.category_id);
  }

  await jobRepository.updateJob(id, mapJobPayload(payload));
};

/**
 * Menghapus lowongan kerja.
 *
 * @param {string} id
 * @param {object} actor user yang sedang login
 * @returns {Promise<void>}
 */
const deleteJobById = async (id, actor) => {
  const job = await getJobById(id);

  await verifyCompanyAccess(job.company_id, actor);

  await jobRepository.deleteJob(id);
};

module.exports = {
  addJob,
  getJobs,
  getJobById,
  getJobsByCompanyId,
  getJobsByCategoryId,
  editJobById,
  deleteJobById,
};