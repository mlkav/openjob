/**
 * Entry point HTTP server.
 * Dijalankan melalui `npm run start:dev` (host & port diambil dari file .env).
 */
const app = require('./app');
const config = require('./config');
const pool = require('./db/pool');
const cacheService = require('./services/cache-service');
const rabbitmqPublisher = require('./services/rabbitmq-publisher');

const server = app.listen(config.app.port, () => {
  console.log(
    `Server berjalan pada http://${config.app.host}:${config.app.port}`,
  );
});

const shutdown = (signal) => {
  console.log(`Menutup server setelah menerima ${signal}`);
  server.close(async (error) => {
    if (error) {
      console.error('Gagal menutup HTTP server', error);
      process.exitCode = 1;
    }

    try {
      await Promise.all([
        cacheService.close(),
        rabbitmqPublisher.close(),
        pool.end(),
      ]);
    } catch (closeError) {
      console.error('Gagal menutup koneksi aplikasi', closeError);
      process.exitCode = 1;
    }
  });
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
