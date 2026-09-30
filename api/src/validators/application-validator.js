/**
 * Skema validasi payload untuk resource `applications`.
 */
const Joi = require('joi');

const APPLICATION_STATUSES = ['pending', 'reviewed', 'accepted', 'rejected'];

/** Payload melamar pekerjaan: POST /applications. */
const applicationPayloadSchema = Joi.object({
  user_id: Joi.string().min(1).max(50).required(),
  job_id: Joi.string().min(1).max(50).required(),
  status: Joi.string()
    .valid(...APPLICATION_STATUSES)
    .default('pending'),
});

/** Payload ubah status lamaran: PUT /applications/:id. */
const updateApplicationPayloadSchema = Joi.object({
  status: Joi.string()
    .valid(...APPLICATION_STATUSES)
    .required(),
});

module.exports = { applicationPayloadSchema, updateApplicationPayloadSchema };
