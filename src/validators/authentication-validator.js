/**
 * Skema validasi payload untuk resource `authentications`.
 */
const Joi = require('joi');

/** Payload login: POST /authentications. */
const loginPayloadSchema = Joi.object({
  email: Joi.string().trim().email({ tlds: { allow: false } }).required(),
  password: Joi.string().required(),
});

/** Payload refresh & logout: PUT/DELETE /authentications. */
const refreshTokenPayloadSchema = Joi.object({
  refreshToken: Joi.string().min(1).required(),
});

module.exports = { loginPayloadSchema, refreshTokenPayloadSchema };