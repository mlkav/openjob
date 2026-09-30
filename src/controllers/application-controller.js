/**
 * Controller resource `applications`.
 */

const applicationService = require('../services/application-service');
const { sendSuccess } = require('../utils/response');

/** POST /applications */
const createApplication = async (req, res) => {
  const id = await applicationService.addApplication(req.user, req.body);

  return sendSuccess(res, {
    statusCode: 201,
    data: { id },
    message: 'Lamaran berhasil dikirim',
  });
};

/** GET /applications */
const getApplications = async (req, res) => {
  const applications = await applicationService.getApplications();

  return sendSuccess(res, { data: { applications } });
};

/** GET /applications/:id */
const getApplicationById = async (req, res) => {
  const application = await applicationService.getApplicationById(req.params.id);

  return sendSuccess(res, { data: application });
};

/** GET /applications/user/:userId */
const getApplicationsByUserId = async (req, res) => {
  const applications = await applicationService.getApplicationsByUserId(
    req.params.userId,
  );

  return sendSuccess(res, { data: { applications } });
};

/** GET /applications/job/:jobId */
const getApplicationsByJobId = async (req, res) => {
  const applications = await applicationService.getApplicationsByJobId(
    req.params.jobId,
  );

  return sendSuccess(res, { data: { applications } });
};

/** PUT /applications/:id */
const editApplicationStatusById = async (req, res) => {
  await applicationService.editApplicationStatusById(
    req.params.id,
    req.body.status,
    req.user,
  );

  return sendSuccess(res, {
    message: 'Status lamaran berhasil diperbarui',
  });
};

/** DELETE /applications/:id */
const deleteApplicationById = async (req, res) => {
  await applicationService.deleteApplicationById(req.params.id, req.user);

  return sendSuccess(res, {
    message: 'Lamaran berhasil dihapus',
  });
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

// /**
//  * Controller resource `applications`.
//  */
// const applicationService = require('../services/application-service');
// const { sendSuccess } = require('../utils/response');

// /** POST /applications */
// const createApplication = async (req, res, next) => {
//   try {
//     const id = await applicationService.addApplication(req.user, req.body);

//     return sendSuccess(res, {
//       statusCode: 201,
//       data: { id },
//       message: 'Lamaran berhasil dikirim',
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// /** GET /applications */
// const getApplications = async (req, res, next) => {
//   try {
//     const applications = await applicationService.getApplications();

//     return sendSuccess(res, { data: { applications } });
//   } catch (error) {
//     return next(error);
//   }
// };

// /** GET /applications/:id */
// const getApplicationById = async (req, res, next) => {
//   try {
//     const application = await applicationService.getApplicationById(req.params.id);

//     return sendSuccess(res, { data: application });
//   } catch (error) {
//     return next(error);
//   }
// };

// /** GET /applications/user/:userId */
// const getApplicationsByUserId = async (req, res, next) => {
//   try {
//     const applications = await applicationService.getApplicationsByUserId(req.params.userId);

//     return sendSuccess(res, { data: { applications } });
//   } catch (error) {
//     return next(error);
//   }
// };

// /** GET /applications/job/:jobId */
// const getApplicationsByJobId = async (req, res, next) => {
//   try {
//     const applications = await applicationService.getApplicationsByJobId(req.params.jobId);

//     return sendSuccess(res, { data: { applications } });
//   } catch (error) {
//     return next(error);
//   }
// };

// /** PUT /applications/:id */
// const editApplicationStatusById = async (req, res, next) => {
//   try {
//     await applicationService.editApplicationStatusById(req.params.id, req.body.status, req.user);

//     return sendSuccess(res, { message: 'Status lamaran berhasil diperbarui' });
//   } catch (error) {
//     return next(error);
//   }
// };

// /** DELETE /applications/:id */
// const deleteApplicationById = async (req, res, next) => {
//   try {
//     await applicationService.deleteApplicationById(req.params.id, req.user);

//     return sendSuccess(res, { message: 'Lamaran berhasil dihapus' });
//   } catch (error) {
//     return next(error);
//   }
// };

// module.exports = {
//   createApplication,
//   getApplications,
//   getApplicationById,
//   getApplicationsByUserId,
//   getApplicationsByJobId,
//   editApplicationStatusById,
//   deleteApplicationById,
// };