/**
 * Route resource `jobs`.
 * Perhatikan urutan route: path yang lebih spesifik (`/company/:companyId`,
 * `/category/:categoryId`, dan `/:jobId/bookmark`) didaftarkan sebelum `/:id`
 * agar tidak tertangkap oleh parameter id.
 */
const express = require('express');
const authenticate = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  jobPayloadSchema,
  updateJobPayloadSchema,
  jobQuerySchema,
} = require('../validators/job-validator');
const jobController = require('../controllers/job-controller');
const bookmarkController = require('../controllers/bookmark-controller');

const router = express.Router();

// Publik: daftar & detail lowongan, termasuk pencarian.
router.get('/', validate(jobQuerySchema, 'query'), jobController.getJobs);
router.get('/company/:companyId', jobController.getJobsByCompanyId);
router.get('/category/:categoryId', jobController.getJobsByCategoryId);
router.get('/:id', jobController.getJobById);

// Terproteksi: pengelolaan lowongan.
router.post(
  '/',
  authenticate,
  validate(jobPayloadSchema),
  jobController.createJob,
);
router.put(
  '/:id',
  authenticate,
  validate(updateJobPayloadSchema),
  jobController.editJobById,
);
router.delete('/:id', authenticate, jobController.deleteJobById);

// Terproteksi: bookmark dengan pola /jobs/:jobId/bookmark.
router.post(
  '/:jobId/bookmark',
  authenticate,
  bookmarkController.createBookmark,
);
router.get(
  '/:jobId/bookmark/:id',
  authenticate,
  bookmarkController.getBookmarkById,
);
router.delete(
  '/:jobId/bookmark',
  authenticate,
  bookmarkController.deleteBookmark,
);

module.exports = router;
