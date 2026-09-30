/**
 * Service lamaran kerja.
 * Menegakkan otorisasi: user hanya boleh melamar atas nama akunnya sendiri,
 * sedangkan perubahan status lamaran boleh dilakukan oleh pelamar maupun
 * pemilik perusahaan yang membuka lowongan (atau admin).
 */
const applicationRepository = require('../repositories/application-repository');
const jobRepository = require('../repositories/job-repository');
const companyRepository = require('../repositories/company-repository');
const userRepository = require('../repositories/user-repository');
const { verifyOwnership } = require('../utils/authorization');
const { AuthorizationError, NotFoundError } = require('../utils/errors');
const cacheService = require('./cache-service');
const cacheKeys = require('../utils/cache-keys');
const { publishApplicationCreated } = require('./rabbitmq-publisher');

/**
 * Mengambil lamaran kerja beserta validasi keberadaannya.
 *
 * @param {string} id
 * @returns {Promise<object>}
 * @throws {NotFoundError}
 */
const getApplicationById = async (id) => {
  const application = await applicationRepository.getApplicationById(id);

  if (!application) {
    throw new NotFoundError('Lamaran tidak ditemukan');
  }

  return application;
};

/**
 * Memastikan aktor berhak mengubah lamaran: pelamar, pemilik perusahaan
 * lowongan tersebut, atau admin.
 *
 * @param {object} application
 * @param {object} actor
 * @throws {AuthorizationError}
 */
const verifyApplicationAccess = async (application, actor) => {
  if (application.user_id === actor.id || actor.role === 'admin') {
    return;
  }

  const company = await companyRepository.getCompanyById(
    application.company_id,
  );

  verifyOwnership(
    company ? company.user_id : null,
    actor,
    'Anda tidak berhak mengubah lamaran ini',
  );
};

/**
 * Menambahkan lamaran kerja baru.
 *
 * @param {object} actor user yang sedang login
 * @param {object} payload
 * @param {string} payload.user_id
 * @param {string} payload.job_id
 * @param {string} [payload.status]
 * @returns {Promise<object>} lamaran yang baru dibuat
 */
const addApplication = async (
  actor,
  { user_id: userId, job_id: jobId, status },
) => {
  if (actor.id !== userId && actor.role !== 'admin') {
    throw new AuthorizationError(
      'Anda hanya dapat melamar untuk akun Anda sendiri',
    );
  }

  const user = await userRepository.getUserById(userId);

  if (!user) {
    throw new NotFoundError('User tidak ditemukan');
  }

  const job = await jobRepository.getJobById(jobId);

  if (!job) {
    throw new NotFoundError('Lowongan tidak ditemukan');
  }

  // Kombinasi user & job dijaga oleh UNIQUE constraint (applications_user_job_unique).
  const application = await applicationRepository.createApplication({
    userId,
    jobId,
    status,
  });
  await cacheService.invalidate(
    cacheKeys.applicationsByUser(userId),
    cacheKeys.applicationsByJob(jobId),
  );
  await publishApplicationCreated(application.id);
  return application;
};

/**
 * Mengambil seluruh lamaran kerja.
 *
 * @returns {Promise<Array<object>>}
 */
const getApplications = async () => applicationRepository.getApplications();

/**
 * Mengambil lamaran kerja berdasarkan user.
 *
 * @param {string} userId
 * @returns {Promise<Array<object>>}
 */
const getApplicationsByUserId = async (userId) =>
  applicationRepository.getApplicationsByUserId(userId);

/**
 * Mengambil lamaran kerja berdasarkan lowongan.
 *
 * @param {string} jobId
 * @returns {Promise<Array<object>>}
 */
const getApplicationsByJobId = async (jobId) =>
  applicationRepository.getApplicationsByJobId(jobId);

/**
 * Mengubah status lamaran kerja.
 *
 * @param {string} id
 * @param {string} status
 * @param {object} actor
 * @returns {Promise<void>}
 */
const editApplicationStatusById = async (id, status, actor) => {
  const application = await getApplicationById(id);

  await verifyApplicationAccess(application, actor);

  await applicationRepository.updateApplicationStatus(id, status);
  await cacheService.invalidate(
    cacheKeys.application(id),
    cacheKeys.applicationsByUser(application.user_id),
    cacheKeys.applicationsByJob(application.job_id),
  );
};

/**
 * Menghapus lamaran kerja.
 *
 * @param {string} id
 * @param {object} actor
 * @returns {Promise<void>}
 */
const deleteApplicationById = async (id, actor) => {
  const application = await getApplicationById(id);

  await verifyApplicationAccess(application, actor);

  await applicationRepository.deleteApplication(id);
  await cacheService.invalidate(
    cacheKeys.application(id),
    cacheKeys.applicationsByUser(application.user_id),
    cacheKeys.applicationsByJob(application.job_id),
  );
};

module.exports = {
  addApplication,
  getApplications,
  getApplicationById,
  getApplicationsByUserId,
  getApplicationsByJobId,
  editApplicationStatusById,
  deleteApplicationById,
};
