/**
 * Controller resource `companies`.
 * Aksi tulis membutuhkan `req.user` yang diisi oleh middleware authenticate.
 */
const companyService = require('../services/company-service');
const { sendSuccess } = require('../utils/response');

/** POST /companies */
const createCompany = async (req, res, next) => {
  try {
    const id = await companyService.addCompany(req.user.id, req.body);

    return sendSuccess(res, {
      statusCode: 201,
      data: { id },
      message: 'Perusahaan berhasil ditambahkan',
    });
  } catch (error) {
    return next(error);
  }
};

/** GET /companies */
const getCompanies = async (req, res, next) => {
  try {
    const companies = await companyService.getCompanies();

    return sendSuccess(res, { data: { companies } });
  } catch (error) {
    return next(error);
  }
};

/** GET /companies/:id */
const getCompanyById = async (req, res, next) => {
  try {
    const company = await companyService.getCompanyById(req.params.id);

    return sendSuccess(res, { data: company });
  } catch (error) {
    return next(error);
  }
};

/** PUT /companies/:id */
const editCompanyById = async (req, res, next) => {
  try {
    await companyService.editCompanyById(req.params.id, req.body, req.user);

    return sendSuccess(res, { message: 'Perusahaan berhasil diperbarui' });
  } catch (error) {
    return next(error);
  }
};

/** DELETE /companies/:id */
const deleteCompanyById = async (req, res, next) => {
  try {
    await companyService.deleteCompanyById(req.params.id, req.user);

    return sendSuccess(res, { message: 'Perusahaan berhasil dihapus' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createCompany,
  getCompanies,
  getCompanyById,
  editCompanyById,
  deleteCompanyById,
};