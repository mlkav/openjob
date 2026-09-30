const { randomUUID } = require('crypto');

/**
 * Menghasilkan identifier unik berbentuk string.
 * Menggunakan UUID v4 dari modul `crypto` bawaan Node.js.
 *
 * @returns {string}
 */
const generateId = () => randomUUID();

module.exports = generateId;
