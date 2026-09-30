/**
 * Connection pool PostgreSQL.
 * Kredensial sepenuhnya berasal dari environment variable (file `.env`).
 */
const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  host: config.db.host,
  port: config.db.port,
});

pool.on('error', (error) => {
   
  console.error('Unexpected error on idle PostgreSQL client', error);
});

module.exports = pool;
