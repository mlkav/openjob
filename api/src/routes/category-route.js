/**
 * Route resource `categories`.
 * GET bersifat publik, sedangkan POST/PUT/DELETE wajib terautentikasi.
 */
const express = require('express');
const authenticate = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  categoryPayloadSchema,
  updateCategoryPayloadSchema,
} = require('../validators/category-validator');
const categoryController = require('../controllers/category-controller');

const router = express.Router();

router.get('/', categoryController.getCategories);
router.post(
  '/',
  authenticate,
  validate(categoryPayloadSchema),
  categoryController.createCategory,
);
router.get('/:id', categoryController.getCategoryById);
router.put(
  '/:id',
  authenticate,
  validate(updateCategoryPayloadSchema),
  categoryController.editCategoryById,
);
router.delete('/:id', authenticate, categoryController.deleteCategoryById);

module.exports = router;
