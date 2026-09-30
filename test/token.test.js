const assert = require('node:assert/strict');
const test = require('node:test');
const jwt = require('jsonwebtoken');
const config = require('../src/config');
const {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require('../src/utils/token');

test('access token contains user id and expires after three hours', () => {
  const token = createAccessToken({ id: 'user-1', role: 'user' });
  const payload = verifyAccessToken(token);
  const decoded = jwt.verify(token, config.jwt.accessTokenKey);

  assert.equal(payload.id, 'user-1');
  assert.equal(decoded.id, 'user-1');
  assert.ok(decoded.exp - decoded.iat <= 10800);
  assert.ok(decoded.exp - decoded.iat > 10790);
});

test('refresh token is signed with its dedicated secret', () => {
  const token = createRefreshToken({ id: 'user-1' });
  const payload = verifyRefreshToken(token);

  assert.equal(payload.id, 'user-1');
  assert.equal(jwt.verify(token, config.jwt.refreshTokenKey).id, 'user-1');
});
