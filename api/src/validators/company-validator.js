/**
 * Skema validasi payload untuk resource `companies`.
 */
const Joi = require('joi');

/** Payload tambah perusahaan: POST /companies. */
const companyPayloadSchema = Joi.object({
  name: Joi.string().trim().min(1).max(150).required(),
  location: Joi.string().trim().min(1).max(255).required(),
  description: Joi.string().trim().min(1).required(),
});

/**
 * Payload ubah perusahaan: PUT /companies/:id.
 * Minimal satu atribut harus dikirim.
 */
const updateCompanyPayloadSchema = Joi.object({
  name: Joi.string().trim().min(1).max(150),
  location: Joi.string().trim().min(1).max(255),
  description: Joi.string().trim().min(1),
}).min(1);

module.exports = { companyPayloadSchema, updateCompanyPayloadSchema };
