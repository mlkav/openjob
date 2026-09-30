const assert = require('node:assert/strict');
const test = require('node:test');
const multer = require('multer');
const {
  MAX_PDF_FILE_SIZE,
  PDF_MIME_TYPE,
  validatePdfMimeType,
  handleMulterError,
} = require('../src/middlewares/upload-document');
const { TTL_SECONDS } = require('../src/services/cache-service');
const {
  serializeApplicationCreatedMessage,
} = require('../src/services/rabbitmq-publisher');
const cacheKeys = require('../src/utils/cache-keys');
const { updateUserPayloadSchema } = require('../src/validators/user-validator');

test('PDF upload enforces the five-megabyte limit and PDF MIME type', () => {
  assert.equal(MAX_PDF_FILE_SIZE, 5 * 1024 * 1024);
  assert.equal(PDF_MIME_TYPE, 'application/pdf');
});

test('non-PDF uploads return the expected required-file validation message', () => {
  let error;

  validatePdfMimeType({}, { mimetype: 'text/plain' }, (validationError) => {
    error = validationError;
  });

  assert.match(error.message, /File is required/);
});

test('oversized document uploads return HTTP 413', () => {
  let statusCode;
  let responseBody;
  const response = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    },
  };

  handleMulterError(
    new multer.MulterError('LIMIT_FILE_SIZE'),
    {},
    response,
    assert.fail,
  );

  assert.equal(statusCode, 413);
  assert.equal(responseBody.status, 'failed');
});

test('cache keys are resource- and user-specific with one-hour expiration', () => {
  assert.notEqual(cacheKeys.user('user-a'), cacheKeys.user('user-b'));
  assert.notEqual(
    cacheKeys.applicationsByJob('job-a'),
    cacheKeys.applicationsByJob('job-b'),
  );
  assert.equal(TTL_SECONDS, 3600);
});

test('application-created message contains only application_id', () => {
  assert.deepEqual(
    JSON.parse(serializeApplicationCreatedMessage('application-1')),
    { application_id: 'application-1' },
  );
});

test('user update requires at least one supported field', () => {
  assert.ok(updateUserPayloadSchema.validate({}).error);
  assert.equal(
    updateUserPayloadSchema.validate({ name: 'Updated' }).error,
    undefined,
  );
  assert.ok(updateUserPayloadSchema.validate({ role: 'admin' }).error);
});
