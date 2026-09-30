/**
 * Utilitas hashing password menggunakan bcrypt.
 * Password user tidak pernah disimpan dalam bentuk plain text.
 */
const bcrypt = require('bcrypt');
const config = require('../config');

/**
 * Membuat hash password.
 *
 * @param {string} plainPassword
 * @returns {Promise<string>}
 */
const hashPassword = (plainPassword) =>
  bcrypt.hash(plainPassword, config.security.bcryptSaltRounds);

/**
 * Membandingkan password plain text dengan hash milik user.
 *
 * @param {string} plainPassword
 * @param {string} hashedPassword
 * @returns {Promise<boolean>}
 */
const comparePassword = (plainPassword, hashedPassword) =>
  bcrypt.compare(plainPassword, hashedPassword);

module.exports = { hashPassword, comparePassword };
