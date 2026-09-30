/**
 * Middleware error handling terpusat.
 * - 404 untuk endpoint yang tidak terdaftar.
 * - 4xx untuk error yang memang berasal dari client (ClientError).
 * - 400 untuk pelanggaran constraint PostgreSQL (unique/foreign key/check).
 * - 500 untuk kegagalan tak terduga pada server.
 */
// eslint-disable-next-line no-unused-vars
const notFoundHandler = (req, res, next) =>
  res.status(404).json({
    status: 'failed',
    message: `Resource ${req.method} ${req.originalUrl} tidak ditemukan`,
  });

/**
 * Memetakan kode error PostgreSQL menjadi pesan yang ramah bagi client.
 *
 * @param {string} code
 * @returns {string|null}
 */
const mapDatabaseError = (code) => {
  const messages = {
    23505: 'Data yang dikirim sudah terdaftar sebelumnya',
    23503: 'Data terkait tidak ditemukan',
    23514: 'Data yang dikirim tidak memenuhi aturan yang berlaku',
    23502: 'Terdapat data wajib yang belum diisi',
  };

  return messages[code] || null;
};

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  // Error dari ClientError (InvariantError, AuthenticationError, dst).
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      status: 'failed',
      message: error.message,
    });
  }

  // Body request bukan JSON yang valid.
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      status: 'failed',
      message: 'Payload request bukan JSON yang valid',
    });
  }

  // Pelanggaran constraint pada database.
  const databaseMessage = mapDatabaseError(error.code);

  if (databaseMessage) {
    return res.status(400).json({
      status: 'failed',
      message: databaseMessage,
    });
  }

  console.error(error);

  return res.status(500).json({
    status: 'failed',
    message: 'Maaf, terjadi kegagalan pada server kami.',
  });
};

module.exports = { notFoundHandler, errorHandler };
