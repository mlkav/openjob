const assert = require('node:assert/strict');
const test = require('node:test');
const pool = require('../../src/db/pool');

test('PostgreSQL connection is configured', async () => {
  const result = await pool.query('select current_database() as database');
  assert.equal(result.rowCount, 1);
  assert.equal(result.rows[0].database, configDatabaseName());
});

const configDatabaseName = () => require('../../src/config').db.database;
