/**
 * Konfigurasi aplikasi.
 * Seluruh nilai sensitif (kredensial database & secret key JWT) dibaca dari
 * environment variable yang dimuat file `.env`, tidak ada yang di-hardcode.
 */
require('dotenv').config();

const config = {
  app: {
    host: process.env.HOST,
    port: Number(process.env.PORT),
  },
  db: {
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME,
  },
  rabbitmq: {
    host: process.env.RABBITMQ_HOST,
    port: Number(process.env.RABBITMQ_PORT),
    username: process.env.RABBITMQ_USER,
    password: process.env.RABBITMQ_PASSWORD,
    queue: process.env.RABBITMQ_QUEUE || 'applications.created',
  },
  jwt: {
    accessTokenKey: process.env.ACCESS_TOKEN_KEY,
    refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
    accessTokenAge: '3h', // Masa berlaku access token: 3 jam
  },
  security: {
    // Jumlah salt round untuk hashing password (bcrypt).
    bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS),
  },
  documentsDirectory:
    process.env.DOCUMENTS_DIRECTORY ||
    require('path').resolve(__dirname, '../uploads/documents'),
};

module.exports = config;
