/**
 * Entry point HTTP server.
 * Dijalankan melalui `npm run start:dev` (host & port diambil dari file .env).
 */
const app = require('./app');
const config = require('./config');

app.listen(config.app.port, () => {
   
  console.log(`Server berjalan pada http://${config.app.host}:${config.app.port}`);
});