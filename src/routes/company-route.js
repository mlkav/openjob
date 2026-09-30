/**
 * Route resource `companies`.
 * GET bersifat publik, sedangkan POST/PUT/DELETE wajib terautentikasi.
 * Middleware `authenticate` dijalankan sebelum validasi agar request tanpa
 * token selalu menghasilkan 401.
 */
const express = require('express');
const authenticate = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  companyPayloadSchema,
  updateCompanyPayloadSchema,
} = require('../validators/company-validator');
const companyController = require('../controllers/company-controller');

const router = express.Router();

router.get('/', companyController.getCompanies);
router.post('/', authenticate, validate(companyPayloadSchema), companyController.createCompany);
router.get('/:id', companyController.getCompanyById);
router.put(
  '/:id',
  authenticate,
  validate(updateCompanyPayloadSchema),
  companyController.editCompanyById,
);
router.delete('/:id', authenticate, companyController.deleteCompanyById);

module.exports = router;