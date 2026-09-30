/**
 * Controller resource `categories`.
 */
const categoryService = require('../services/category-service');
const { sendSuccess } = require('../utils/response');

/** POST /categories */
const createCategory = async (req, res, next) => {
  try {
    const id = await categoryService.addCategory(req.body);

    return sendSuccess(res, {
      statusCode: 201,
      data: { id },
      message: 'Kategori berhasil ditambahkan',
    });
  } catch (error) {
    return next(error);
  }
};

/** GET /categories */
const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getCategories();

    return sendSuccess(res, { data: { categories } });
  } catch (error) {
    return next(error);
  }
};

/** GET /categories/:id */
const getCategoryById = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);

    return sendSuccess(res, { data: category });
  } catch (error) {
    return next(error);
  }
};

/** PUT /categories/:id */
const editCategoryById = async (req, res, next) => {
  try {
    await categoryService.editCategoryById(req.params.id, req.body);

    return sendSuccess(res, { message: 'Kategori berhasil diperbarui' });
  } catch (error) {
    return next(error);
  }
};

/** DELETE /categories/:id */
const deleteCategoryById = async (req, res, next) => {
  try {
    await categoryService.deleteCategoryById(req.params.id);

    return sendSuccess(res, { message: 'Kategori berhasil dihapus' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  editCategoryById,
  deleteCategoryById,
};
