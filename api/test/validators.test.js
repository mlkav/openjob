const assert = require('node:assert/strict');
const test = require('node:test');
const { userPayloadSchema } = require('../src/validators/user-validator');
const {
  jobPayloadSchema,
  jobQuerySchema,
} = require('../src/validators/job-validator');

test('user registration rejects incomplete and invalid payloads', () => {
  assert.ok(userPayloadSchema.validate({}).error);
  assert.ok(
    userPayloadSchema.validate({
      name: 'John',
      email: 'invalid',
      password: '123',
    }).error,
  );
  assert.equal(
    userPayloadSchema.validate({
      name: 'John',
      email: 'john@example.com',
      password: 'password123',
    }).error,
    undefined,
  );
});

test('job search treats empty values as no filter', () => {
  const result = jobQuerySchema.validate({ title: '', 'company-name': '' });
  assert.equal(result.error, undefined);
  assert.equal(result.value.title, '');
  assert.equal(result.value['company-name'], '');
});

test('job payload rejects reversed salary ranges', () => {
  const result = jobPayloadSchema.validate({
    company_id: 'company-id',
    category_id: 'category-id',
    title: 'Backend Developer',
    description: 'Build APIs',
    job_type: 'full-time',
    experience_level: 'senior',
    location_type: 'remote',
    salary_min: 20,
    salary_max: 10,
  });
  assert.ok(result.error);
});
