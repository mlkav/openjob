/**
 * Service entitas user.
 * Menangani business logic pendaftaran user: pengecekan keunikan email,
 * hashing password, dan pengambilan data profil.
 */
const userRepository = require('../repositories/user-repository');
const { hashPassword } = require('../utils/password');
const { InvariantError, NotFoundError } = require('../utils/errors');

/**
 * Menambahkan user baru.
 *
 * @param {object} payload
 * @param {string} payload.name
 * @param {string} payload.email
 * @param {string} payload.password password plain text dari client
 * @param {string} [payload.role]
 * @returns {Promise<string>} id user
 * @throws {InvariantError} bila email sudah terdaftar
 */
const addUser = async ({
  name, email, password, role,
}) => {
  const existingUser = await userRepository.getUserByEmail(email);

  if (existingUser) {
    throw new InvariantError('Gagal menambahkan user. Email sudah digunakan.');
  }

  // Password disimpan dalam bentuk hash, bukan plain text.
  const hashedPassword = await hashPassword(password);

  return userRepository.createUser({
    name,
    email,
    password: hashedPassword,
    role,
  });
};

/**
 * Mengambil user berdasarkan id.
 *
 * @param {string} id
 * @returns {Promise<object>}
 * @throws {NotFoundError} bila user tidak ditemukan
 */
const getUserById = async (id) => {
  const user = await userRepository.getUserById(id);

  if (!user) {
    throw new NotFoundError('User tidak ditemukan');
  }

  return user;
};

module.exports = { addUser, getUserById };