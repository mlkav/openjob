/**
 * Skema validasi payload untuk resource `users`.
 */
const Joi = require('joi');

const userPayloadSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string().trim().email({ tlds: { allow: false } }).max(100).required(),
  password: Joi.string().min(6).max(255).required(),
  role: Joi.string().valid('user', 'jobseeker', 'employer', 'admin').default('user'),
});

module.exports = { userPayloadSchema };