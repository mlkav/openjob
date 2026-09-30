/**
 * Controller resource `jobs`.
 * Pencarian lowongan mendukung query parameter `title` dan `company-name`
 * yang telah dinormalisasi oleh validator (nilai kosong = tanpa filter).
 */
const jobService = require('../services/job-service');
const { sendSuccess } = require('../utils/response');

/** POST /jobs */
const createJob = async (req, res, next) => {
  try {
    const id = await jobService.addJob(req.user, req.body);

    return sendSuccess(res, {
      statusCode: 201,
      data: { id },
      message: 'Lowongan berhasil ditambahkan',
    });
  } catch (error) {
    return next(error);
  }
};

/** GET /jobs?title=...&company-name=... */
const getJobs = async (req, res, next) => {
  try {
    const { title = '', 'company-name': companyName = '' } =
      req.validated.query;
    const jobs = await jobService.getJobs({ title, companyName });

    return sendSuccess(res, { data: { jobs } });
  } catch (error) {
    return next(error);
  }
};

/** GET /jobs/:id */
const getJobById = async (req, res, next) => {
  try {
    const job = await jobService.getJobById(req.params.id);

    return sendSuccess(res, { data: job });
  } catch (error) {
    return next(error);
  }
};

/** GET /jobs/company/:companyId */
const getJobsByCompanyId = async (req, res, next) => {
  try {
    const jobs = await jobService.getJobsByCompanyId(req.params.companyId);

    return sendSuccess(res, { data: { jobs } });
  } catch (error) {
    return next(error);
  }
};

/** GET /jobs/category/:categoryId */
const getJobsByCategoryId = async (req, res, next) => {
  try {
    const jobs = await jobService.getJobsByCategoryId(req.params.categoryId);

    return sendSuccess(res, { data: { jobs } });
  } catch (error) {
    return next(error);
  }
};

/** PUT /jobs/:id */
const editJobById = async (req, res, next) => {
  try {
    await jobService.editJobById(req.params.id, req.body, req.user);

    return sendSuccess(res, { message: 'Lowongan berhasil diperbarui' });
  } catch (error) {
    return next(error);
  }
};

/** DELETE /jobs/:id */
const deleteJobById = async (req, res, next) => {
  try {
    await jobService.deleteJobById(req.params.id, req.user);

    return sendSuccess(res, { message: 'Lowongan berhasil dihapus' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  getJobsByCompanyId,
  getJobsByCategoryId,
  editJobById,
  deleteJobById,
};
