/**
 * Service kategori pekerjaan.
 * Duplikasi nama kategori dijaga oleh UNIQUE constraint pada tabel `categories`
 * yang otomatis dipetakan menjadi response 400 oleh error handler global.
 */
const categoryRepository = require('../repositories/category-repository');
const { NotFoundError } = require('../utils/errors');

/**
 * Menambahkan kategori baru.
 *
 * @param {object} payload
 * @param {string} payload.name
 * @returns {Promise<string>} id kategori
 */
const addCategory = async ({ name }) => categoryRepository.createCategory({ name });

/**
 * Mengambil seluruh kategori.
 *
 * @returns {Promise<Array<object>>}
 */
const getCategories = async () => categoryRepository.getCategories();

/**
 * Mengambil kategori berdasarkan id.
 *
 * @param {string} id
 * @returns {Promise<object>}
 * @throws {NotFoundError} bila kategori tidak ditemukan
 */
const getCategoryById = async (id) => {
  const category = await categoryRepository.getCategoryById(id);

  if (!category) {
    throw new NotFoundError('Kategori tidak ditemukan');
  }

  return category;
};

/**
 * Mengubah data kategori.
 *
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<void>}
 * @throws {NotFoundError} bila kategori tidak ditemukan
 */
const editCategoryById = async (id, payload) => {
  await getCategoryById(id);

  await categoryRepository.updateCategory(id, payload);
};

/**
 * Menghapus kategori.
 *
 * @param {string} id
 * @returns {Promise<void>}
 * @throws {NotFoundError} bila kategori tidak ditemukan
 */
const deleteCategoryById = async (id) => {
  const deletedId = await categoryRepository.deleteCategory(id);

  if (!deletedId) {
    throw new NotFoundError('Kategori tidak ditemukan');
  }
};

module.exports = {
  addCategory,
  getCategories,
  getCategoryById,
  editCategoryById,
  deleteCategoryById,
};