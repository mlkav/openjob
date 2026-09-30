/**
 * Route resource `documents`.
 * Unggah dan penghapusan memerlukan autentikasi; daftar dan unduhan bersifat
 * publik.
 */
const express = require('express');
const authenticate = require('../middlewares/auth');
const { uploadDocument } = require('../middlewares/upload-document');
const documentController = require('../controllers/document-controller');

const router = express.Router();

/** POST /documents — unggah dokumen PDF milik user yang login. */
router.post(
  '/',
  authenticate,
  uploadDocument,
  documentController.uploadDocument,
);
/** GET /documents — mengambil daftar dokumen. */
router.get('/', documentController.getDocuments);
/** GET /documents/:id — mengunduh dokumen berdasarkan id. */
router.get('/:id', documentController.getDocumentById);
/** DELETE /documents/:id — menghapus dokumen milik user atau oleh admin. */
router.delete('/:id', authenticate, documentController.deleteDocument);

module.exports = router;
