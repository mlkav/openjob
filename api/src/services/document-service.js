const fs = require('node:fs/promises');
const path = require('node:path');
const config = require('../config');
const documentRepository = require('../repositories/document-repository');
const {
  AuthorizationError,
  InvariantError,
  NotFoundError,
} = require('../utils/errors');

/**
 * Service dokumen.
 * Menangani unggah, pengambilan, dan penghapusan dokumen PDF beserta
 * pemeriksaan akses pemilik dokumen.
 */

/**
 * Menghapus berkas unggahan, dan mengabaikan kondisi saat berkas tidak ada.
 *
 * @param {string} filePath lokasi berkas di penyimpanan
 * @returns {Promise<void>}
 */
const removeUploadedFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};

/**
 * Memeriksa apakah berkas diawali signature PDF.
 *
 * @param {string} filePath lokasi berkas yang akan diperiksa
 * @returns {Promise<boolean>}
 */
const verifyPdfSignature = async (filePath) => {
  const file = await fs.open(filePath, 'r');

  try {
    const signature = Buffer.alloc(5);
    const { bytesRead } = await file.read(signature, 0, signature.length, 0);
    return bytesRead === signature.length && signature.toString() === '%PDF-';
  } finally {
    await file.close();
  }
};

/**
 * Menyimpan dokumen PDF yang diunggah dan membuat catatan dokumennya.
 *
 * @param {string} userId id user pemilik dokumen
 * @param {object} file berkas hasil unggahan
 * @param {string} file.originalname nama asli berkas
 * @param {string} file.filename nama berkas di penyimpanan
 * @param {string} file.path lokasi berkas sementara/tersimpan
 * @param {number} file.size ukuran berkas dalam byte
 * @returns {Promise<object>} informasi dokumen yang baru dibuat
 * @throws {InvariantError} bila berkas tidak disediakan, nama berkas tidak valid,
 * atau signature berkas bukan PDF
 */
const addDocument = async (userId, file) => {
  if (!file) {
    throw new InvariantError('File is required');
  }

  const originalName = path.posix.basename(
    file.originalname.replace(/\\/g, '/'),
  );

  try {
    if (!originalName || originalName.length > 255) {
      throw new InvariantError(
        'Original filename must be between 1 and 255 characters',
      );
    }

    if (!(await verifyPdfSignature(file.path))) {
      throw new InvariantError('Uploaded file is not a valid PDF document');
    }

    const id = await documentRepository.createDocument({
      userId,
      filename: file.filename,
      originalName,
      size: file.size,
    });

    return {
      documentId: id,
      filename: file.filename,
      originalName,
      size: file.size,
    };
  } catch (error) {
    await removeUploadedFile(file.path);
    throw error;
  }
};

/**
 * Mengambil seluruh dokumen.
 *
 * @returns {Promise<Array<object>>}
 */
const getDocuments = async () => documentRepository.getDocuments();

/**
 * Mengambil dokumen beserta lokasi berkasnya untuk ditampilkan.
 *
 * @param {string} id id dokumen
 * @returns {Promise<object>} data dokumen dengan properti `path`
 * @throws {NotFoundError} bila dokumen atau berkasnya tidak ditemukan
 */
const getDocumentForView = async (id) => {
  const document = await documentRepository.getDocumentById(id);

  if (!document) {
    throw new NotFoundError('Dokumen tidak ditemukan');
  }

  const filePath = path.join(config.documentsDirectory, document.filename);

  try {
    await fs.access(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new NotFoundError('Berkas dokumen tidak ditemukan');
    }
    throw error;
  }

  return {
    ...document,
    path: filePath,
  };
};

/**
 * Menghapus dokumen setelah memeriksa hak akses aktor.
 *
 * @param {string} id id dokumen
 * @param {object} actor user yang sedang login
 * @param {string} actor.id id user
 * @param {string} actor.role peran user
 * @returns {Promise<void>}
 * @throws {NotFoundError} bila dokumen tidak ditemukan
 * @throws {AuthorizationError} bila aktor bukan pemilik dokumen atau admin
 */
const deleteDocument = async (id, actor) => {
  const document = await documentRepository.getDocumentById(id);

  if (!document) {
    throw new NotFoundError('Dokumen tidak ditemukan');
  }

  if (document.user_id !== actor.id && actor.role !== 'admin') {
    throw new AuthorizationError('Anda tidak berhak menghapus dokumen ini');
  }

  await documentRepository.deleteDocument(id);
  await removeUploadedFile(
    path.join(config.documentsDirectory, document.filename),
  );
};

module.exports = {
  addDocument,
  getDocuments,
  getDocumentForView,
  deleteDocument,
};
