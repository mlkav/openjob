/**
 * Controller resource `companies`.
 * Write membutuhkan `req.user` yang diisi oleh middleware authenticate.
 */
const companyService = require('../services/company-service');
const { sendSuccess } = require('../utils/response');
const cacheService = require('../services/cache-service');
const cacheKeys = require('../utils/cache-keys');

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
    const result = await cacheService.remember(
      cacheKeys.company(req.params.id),
      () => companyService.getCompanyById(req.params.id),
    );
    res.set('X-Data-Source', result.source);

    return sendSuccess(res, { data: result.data });
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
