/**
 * Service entitas user.
 * Menangani business logic pendaftaran user: pengecekan keunikan email,
 * hashing password, dan pengambilan data profil.
 */
const userRepository = require('../repositories/user-repository');
const { hashPassword } = require('../utils/password');
const {
  AuthorizationError,
  InvariantError,
  NotFoundError,
} = require('../utils/errors');
const { verifyOwnership } = require('../utils/authorization');
const cacheService = require('./cache-service');
const cacheKeys = require('../utils/cache-keys');

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
const addUser = async ({ name, email, password, role }) => {
  const existingUser = await userRepository.getUserByEmail(email);

  if (existingUser) {
    throw new InvariantError('Gagal menambahkan user. Email sudah digunakan.');
  }

  // Password disimpan dalam bentuk hash, bukan plain text.
  const hashedPassword = await hashPassword(password);

  const id = await userRepository.createUser({
    name,
    email,
    password: hashedPassword,
    role,
  });
  await cacheService.invalidate(cacheKeys.user(id));
  return id;
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

const editUserById = async (id, payload, actor) => {
  const user = await getUserById(id);

  if (actor.id !== id && actor.role !== 'admin') {
    throw new AuthorizationError('Anda tidak berhak mengubah user ini');
  }

  verifyOwnership(user.id, actor, 'Anda tidak berhak mengubah user ini');
  const updatedPayload = {
    ...payload,
    password: payload.password
      ? await hashPassword(payload.password)
      : undefined,
  };
  await userRepository.updateUser(id, updatedPayload);
  await cacheService.invalidate(cacheKeys.user(id));
};

module.exports = { addUser, getUserById, editUserById };
