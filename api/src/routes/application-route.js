/**
 * Route resource `applications`.
 * Seluruh endpoint bersifat terproteksi (butuh access token).
 */
const express = require('express');
const authenticate = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  applicationPayloadSchema,
  updateApplicationPayloadSchema,
} = require('../validators/application-validator');
const applicationController = require('../controllers/application-controller');

const router = express.Router();

router.get('/', authenticate, applicationController.getApplications);
router.post(
  '/',
  authenticate,
  validate(applicationPayloadSchema),
  applicationController.createApplication,
);
router.get(
  '/user/:userId',
  authenticate,
  applicationController.getApplicationsByUserId,
);
router.get(
  '/job/:jobId',
  authenticate,
  applicationController.getApplicationsByJobId,
);
router.get('/:id', authenticate, applicationController.getApplicationById);
router.put(
  '/:id',
  authenticate,
  validate(updateApplicationPayloadSchema),
  applicationController.editApplicationStatusById,
);
router.delete(
  '/:id',
  authenticate,
  applicationController.deleteApplicationById,
);

module.exports = router;
