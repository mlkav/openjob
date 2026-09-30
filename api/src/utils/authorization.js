/**
 * Utilitas otorisasi.
 * Dipakai untuk memastikan user hanya dapat mengubah data miliknya sendiri
 * (role `admin` diperbolehkan mengelola seluruh data).
 */
const { AuthorizationError } = require('./errors');

/**
 * Memastikan aktor adalah pemilik data atau memiliki role admin.
 *
 * @param {string} ownerId id user pemilik data
 * @param {object} actor user yang sedang login ({ id, role })
 * @param {string} [message]
 * @throws {AuthorizationError} bila aktor bukan pemilik data dan bukan admin
 */
const verifyOwnership = (
  ownerId,
  actor,
  message = 'Anda tidak berhak mengakses data ini',
) => {
  const isOwner = ownerId && actor && ownerId === actor.id;
  const isAdmin = actor && actor.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new AuthorizationError(message);
  }
};

module.exports = { verifyOwnership };
