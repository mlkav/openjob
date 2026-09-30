/**
 * Skema validasi payload untuk resource `users`.
 * Validasi pendaftaran dan perubahan user sebelum payload diteruskan ke
 * controller.
 */
const Joi = require('joi');

/** Payload pendaftaran user: nama, email, password, dan role opsional. */
const userPayloadSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .max(100)
    .required(),
  password: Joi.string().min(6).max(255).required(),
  role: Joi.string()
    .valid('user', 'jobseeker', 'employer', 'admin')
    .default('user'),
});

/**
 * Payload perubahan user.
 * Menerima atribut profil yang dapat diubah dan mensyaratkan minimal satu atribut.
 */
const updateUserPayloadSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100),
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .max(100),
  password: Joi.string().min(6).max(255),
}).min(1);

module.exports = { userPayloadSchema, updateUserPayloadSchema };
