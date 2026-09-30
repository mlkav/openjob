/**
 * Skema validasi payload untuk resource `jobs`.
 * Nilai `job_type`, `experience_level`, `location_type`, dan `status` dibatasi
 * agar konsisten dengan CHECK constraint pada tabel `jobs`.
 */
const Joi = require('joi');

const JOB_TYPES = [
  'full-time',
  'part-time',
  'internship',
  'contract',
  'freelance',
];
const EXPERIENCE_LEVELS = ['junior', 'mid', 'senior', 'lead'];
const LOCATION_TYPES = ['remote', 'onsite', 'hybrid'];
const JOB_STATUSES = ['open', 'closed', 'close'];

/** Validasi tambahan: rentang gaji tidak boleh terbalik. */
const validateSalaryRange = (value, helpers) => {
  const { salary_min: salaryMin, salary_max: salaryMax } = value;

  if (
    salaryMin !== undefined &&
    salaryMax !== undefined &&
    salaryMax < salaryMin
  ) {
    return helpers.error('any.invalid');
  }

  return value;
};

const salaryRangeMessages = {
  'any.invalid':
    'Nilai salary_max harus lebih besar atau sama dengan salary_min',
};

/** Payload tambah lowongan: POST /jobs. */
const jobPayloadSchema = Joi.object({
  company_id: Joi.string().min(1).max(50).required(),
  category_id: Joi.string().min(1).max(50).required(),
  title: Joi.string().trim().min(1).max(150).required(),
  description: Joi.string().trim().min(1).required(),
  job_type: Joi.string()
    .valid(...JOB_TYPES)
    .required(),
  experience_level: Joi.string()
    .valid(...EXPERIENCE_LEVELS)
    .required(),
  location_type: Joi.string()
    .valid(...LOCATION_TYPES)
    .required(),
  location_city: Joi.string().trim().max(100).allow(null, ''),
  salary_min: Joi.number().integer().min(0),
  salary_max: Joi.number().integer().min(0),
  is_salary_visible: Joi.boolean().default(false),
  status: Joi.string()
    .valid(...JOB_STATUSES)
    .default('open'),
})
  .custom(validateSalaryRange)
  .messages(salaryRangeMessages);

/**
 * Payload ubah lowongan: PUT /jobs/:id.
 * Minimal satu atribut harus dikirim.
 */
const updateJobPayloadSchema = Joi.object({
  company_id: Joi.string().min(1).max(50),
  category_id: Joi.string().min(1).max(50),
  title: Joi.string().trim().min(1).max(150),
  description: Joi.string().trim().min(1),
  job_type: Joi.string().valid(...JOB_TYPES),
  experience_level: Joi.string().valid(...EXPERIENCE_LEVELS),
  location_type: Joi.string().valid(...LOCATION_TYPES),
  location_city: Joi.string().trim().max(100).allow(null, ''),
  salary_min: Joi.number().integer().min(0),
  salary_max: Joi.number().integer().min(0),
  is_salary_visible: Joi.boolean(),
  status: Joi.string().valid(...JOB_STATUSES),
})
  .min(1)
  .custom(validateSalaryRange)
  .messages(salaryRangeMessages);

/**
 * Query parameter pencarian job: GET /jobs?title=...&company-name=...
 * Nilai kosong diperbolehkan dan diartikan sebagai tanpa filter.
 */
const jobQuerySchema = Joi.object({
  title: Joi.string().trim().max(150).allow(''),
  'company-name': Joi.string().trim().max(150).allow(''),
}).unknown(true);

module.exports = { jobPayloadSchema, updateJobPayloadSchema, jobQuerySchema };
