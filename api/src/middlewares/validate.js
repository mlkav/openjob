/**
 * Middleware validasi payload dengan Joi.
 * Bila payload tidak sesuai skema, error diteruskan ke error handler global
 * sehingga response berbentuk 400 dengan status `failed`.
 */
const { InvariantError } = require('../utils/errors');

/**
 * Membuat middleware validasi untuk salah satu bagian request.
 *
 * @param {import('joi').ObjectSchema} schema skema Joi
 * @param {'body'|'query'|'params'} [source] bagian request yang divalidasi
 * @returns {import('express').RequestHandler}
 */
const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      allowUnknown: false,
      convert: true,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ');
      return next(new InvariantError(message));
    }

    if (source === 'body') {
      // Payload yang sudah bersih & ter-konversi dipakai oleh controller.
      req.body = value;
    } else {
      // Properti `query`/`params` pada Express bersifat getter-only sehingga
      // hasil validasi disimpan pada properti terpisah.
      req.validated = { ...req.validated, [source]: value };
    }

    return next();
  };

module.exports = validate;
