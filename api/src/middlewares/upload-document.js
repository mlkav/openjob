/**
 * Middleware unggah dokumen PDF.
 * Menyimpan satu berkas maksimal 5 MB ke direktori dokumen dan meneruskan
 * error unggahan Multer dengan respons yang sesuai.
 */
const fs = require('node:fs');
const multer = require('multer');
const generateId = require('../utils/id');
const config = require('../config');
const { InvariantError } = require('../utils/errors');

/** Batas ukuran dokumen PDF yang dapat diunggah, dalam byte. */
const MAX_PDF_FILE_SIZE = 5 * 1024 * 1024;

/** MIME type yang diterima untuk dokumen. */
const PDF_MIME_TYPE = 'application/pdf';

/** Pesan validasi untuk tipe berkas yang tidak diterima. */
const INVALID_PDF_MESSAGE = 'File is required and must be a valid PDF';

/** Menentukan direktori tujuan dan nama unik untuk berkas unggahan. */
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    fs.mkdir(config.documentsDirectory, { recursive: true }, (error) => {
      callback(error, config.documentsDirectory);
    });
  },
  filename: (req, file, callback) => callback(null, `${generateId()}.pdf`),
});

/**
 * Memvalidasi MIME type berkas unggahan.
 *
 * @param {object} req request Express
 * @param {object} file metadata berkas dari Multer
 * @param {Function} callback callback filter Multer
 * @returns {void}
 */
const validatePdfMimeType = (req, file, callback) => {
  if (file.mimetype !== PDF_MIME_TYPE) {
    callback(new InvariantError(INVALID_PDF_MESSAGE));
    return;
  }

  callback(null, true);
};

/** Middleware Multer untuk menerima satu berkas pada field `document`. */
const uploadDocument = multer({
  storage,
  limits: { fileSize: MAX_PDF_FILE_SIZE, files: 1 },
  fileFilter: validatePdfMimeType,
}).single('document');

/**
 * Mengubah error Multer menjadi respons HTTP dan meneruskan error lain.
 *
 * @param {Error} error error dari proses unggah
 * @param {object} req request Express
 * @param {object} res response Express
 * @param {Function} next middleware berikutnya
 * @returns {*} respons error atau hasil penerusan ke middleware berikutnya
 */
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        status: 'failed',
        message: 'File size must not exceed 5 MB',
      });
    }

    return res.status(400).json({
      status: 'failed',
      message:
        error.code === 'LIMIT_UNEXPECTED_FILE'
          ? 'Only one document file is allowed'
          : 'Invalid document upload',
    });
  }

  return next(error);
};

module.exports = {
  MAX_PDF_FILE_SIZE,
  PDF_MIME_TYPE,
  validatePdfMimeType,
  uploadDocument,
  handleMulterError,
};
