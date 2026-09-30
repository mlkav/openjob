/**
 * Service perusahaan.
 * Selain CRUD, layer ini menegakkan otorisasi: hanya pemilik (atau admin) yang
 * boleh mengubah dan menghapus sebuah perusahaan.
 */
const companyRepository = require('../repositories/company-repository');
const { verifyOwnership } = require('../utils/authorization');
const { NotFoundError } = require('../utils/errors');
const cacheService = require('./cache-service');
const cacheKeys = require('../utils/cache-keys');

/**
 * Menambahkan perusahaan milik user yang sedang login.
 *
 * @param {string} userId id user yang sedang login
 * @param {object} payload
 * @returns {Promise<string>} id perusahaan
 */
const addCompany = async (userId, { name, location, description }) => {
  const id = await companyRepository.createCompany({
    name,
    userId,
    location,
    description,
  });
  await cacheService.invalidate(cacheKeys.company(id));
  return id;
};

/**
 * Mengambil seluruh perusahaan.
 *
 * @returns {Promise<Array<object>>}
 */
const getCompanies = async () => companyRepository.getCompanies();

/**
 * Mengambil perusahaan berdasarkan id.
 *
 * @param {string} id
 * @returns {Promise<object>}
 * @throws {NotFoundError} bila perusahaan tidak ditemukan
 */
const getCompanyById = async (id) => {
  const company = await companyRepository.getCompanyById(id);

  if (!company) {
    throw new NotFoundError('Perusahaan tidak ditemukan');
  }

  return company;
};

/**
 * Mengubah perusahaan. Hanya pemilik perusahaan (atau admin) yang diizinkan.
 *
 * @param {string} id
 * @param {object} payload
 * @param {object} actor user yang sedang login
 * @returns {Promise<void>}
 */
const editCompanyById = async (id, payload, actor) => {
  const company = await getCompanyById(id);

  verifyOwnership(
    company.user_id,
    actor,
    'Anda tidak berhak mengubah perusahaan ini',
  );

  await companyRepository.updateCompany(id, payload);
  await cacheService.invalidate(cacheKeys.company(id));
};

/**
 * Menghapus perusahaan. Hanya pemilik perusahaan (atau admin) yang diizinkan.
 *
 * @param {string} id
 * @param {object} actor user yang sedang login
 * @returns {Promise<void>}
 */
const deleteCompanyById = async (id, actor) => {
  const company = await getCompanyById(id);

  verifyOwnership(
    company.user_id,
    actor,
    'Anda tidak berhak menghapus perusahaan ini',
  );

  await companyRepository.deleteCompany(id);
  await cacheService.invalidate(cacheKeys.company(id));
};

module.exports = {
  addCompany,
  getCompanies,
  getCompanyById,
  editCompanyById,
  deleteCompanyById,
};
