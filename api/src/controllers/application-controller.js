/**
 * Controller resource `applications`.
 */

const applicationService = require('../services/application-service');
const { sendSuccess } = require('../utils/response');
const cacheService = require('../services/cache-service');
const cacheKeys = require('../utils/cache-keys');

/** POST /applications */
const createApplication = async (req, res, next) => {
  try {
    const application = await applicationService.addApplication(
      req.user,
      req.body,
    );

    return sendSuccess(res, {
      statusCode: 201,
      data: application,
      message: 'Lamaran berhasil dikirim',
    });
  } catch (error) {
    return next(error);
  }
};

/** GET /applications */
const getApplications = async (req, res, next) => {
  try {
    const applications = await applicationService.getApplications();

    return sendSuccess(res, { data: { applications } });
  } catch (error) {
    return next(error);
  }
};

/** GET /applications/:id */
const getApplicationById = async (req, res, next) => {
  try {
    const result = await cacheService.remember(
      cacheKeys.application(req.params.id),
      () => applicationService.getApplicationById(req.params.id),
    );
    res.set('X-Data-Source', result.source);

    return sendSuccess(res, { data: result.data });
  } catch (error) {
    return next(error);
  }
};

/** GET /applications/user/:userId */
const getApplicationsByUserId = async (req, res, next) => {
  try {
    const result = await cacheService.remember(
      cacheKeys.applicationsByUser(req.params.userId),
      () => applicationService.getApplicationsByUserId(req.params.userId),
    );
    res.set('X-Data-Source', result.source);

    return sendSuccess(res, { data: { applications: result.data } });
  } catch (error) {
    return next(error);
  }
};

/** GET /applications/job/:jobId */
const getApplicationsByJobId = async (req, res, next) => {
  try {
    const result = await cacheService.remember(
      cacheKeys.applicationsByJob(req.params.jobId),
      () => applicationService.getApplicationsByJobId(req.params.jobId),
    );
    res.set('X-Data-Source', result.source);

    return sendSuccess(res, { data: { applications: result.data } });
  } catch (error) {
    return next(error);
  }
};

/** PUT /applications/:id */
const editApplicationStatusById = async (req, res, next) => {
  try {
    await applicationService.editApplicationStatusById(
      req.params.id,
      req.body.status,
      req.user,
    );

    return sendSuccess(res, {
      message: 'Status lamaran berhasil diperbarui',
    });
  } catch (error) {
    return next(error);
  }
};

/** DELETE /applications/:id */
const deleteApplicationById = async (req, res, next) => {
  try {
    await applicationService.deleteApplicationById(req.params.id, req.user);

    return sendSuccess(res, {
      message: 'Lamaran berhasil dihapus',
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  getApplicationsByUserId,
  getApplicationsByJobId,
  editApplicationStatusById,
  deleteApplicationById,
};
