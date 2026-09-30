/**
 * Helper pembentuk response body agar format seluruh endpoint konsisten:
 * - sukses : { status: 'success', data?, message? }
 * - gagal  : { status: 'failed', message }
 */

/**
 * Mengirim response sukses.
 *
 * @param {import('express').Response} res
 * @param {object} options
 * @param {number} [options.statusCode]
 * @param {*} [options.data]
 * @param {string} [options.message]
 */
const sendSuccess = (res, { statusCode = 200, data, message } = {}) => {
  const body = { status: 'success' };

  if (data !== undefined) {
    body.data = data;
  }

  if (message !== undefined) {
    body.message = message;
  }

  return res.status(statusCode).json(body);
};

/**
 * Mengirim response gagal.
 *
 * @param {import('express').Response} res
 * @param {object} options
 * @param {number} [options.statusCode]
 * @param {string} options.message
 */
const sendFailed = (res, { statusCode = 400, message }) =>
  res.status(statusCode).json({ status: 'failed', message });

module.exports = { sendSuccess, sendFailed };
