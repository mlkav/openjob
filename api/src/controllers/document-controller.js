/**
 * Controller resource `documents`.
 * Menangani unggah, pengambilan daftar, unduhan, dan penghapusan dokumen.
 */
const documentService = require('../services/document-service');
const { sendSuccess } = require('../utils/response');

/** POST /documents */
const uploadDocument = async (req, res, next) => {
  try {
    const document = await documentService.addDocument(req.user.id, req.file);
    return sendSuccess(res, {
      statusCode: 201,
      data: document,
      message: 'Dokumen berhasil diunggah',
    });
  } catch (error) {
    return next(error);
  }
};

/** GET /documents */
const getDocuments = async (req, res, next) => {
  try {
    const documents = await documentService.getDocuments();
    return sendSuccess(res, { data: { documents } });
  } catch (error) {
    return next(error);
  }
};

/** GET /documents/:id — mengirim berkas PDF sebagai lampiran. */
const getDocumentById = async (req, res, next) => {
  try {
    const document = await documentService.getDocumentForView(req.params.id);
    res.type('application/pdf');
    res.attachment(document.original_name);
    return res.sendFile(document.path, (error) => {
      if (error && !res.headersSent) {
        next(error);
      }
    });
  } catch (error) {
    return next(error);
  }
};

/** DELETE /documents/:id */
const deleteDocument = async (req, res, next) => {
  try {
    await documentService.deleteDocument(req.params.id, req.user);
    return sendSuccess(res, { message: 'Dokumen berhasil dihapus' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
};
