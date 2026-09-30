/**
 * Skema validasi payload untuk resource `categories`.
 */
const Joi = require('joi');

/** Payload tambah kategori: POST /categories. */
const categoryPayloadSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
});

/**
 * Payload ubah kategori: PUT /categories/:id.
 * Seluruh atribut bersifat opsional, namun minimal satu atribut harus dikirim.
 */
const updateCategoryPayloadSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100),
}).min(1);

module.exports = { categoryPayloadSchema, updateCategoryPayloadSchema };
