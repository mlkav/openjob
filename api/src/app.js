/**
 * Aplikasi Express: pemasangan middleware global, route, dan error handler.
 */
const express = require('express');
const routes = require('./routes');
const {
  notFoundHandler,
  errorHandler,
} = require('./middlewares/error-handler');
const { handleMulterError } = require('./middlewares/upload-document');

const app = express();

// Middleware body parser untuk request berformat JSON dan form.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Seluruh route aplikasi.
app.use(routes);

// Middleware error handling terpusat (harus dipasang paling akhir).
app.use(notFoundHandler);
app.use(handleMulterError);
app.use(errorHandler);

module.exports = app;
