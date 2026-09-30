/**
 * Pembentuk key cache untuk resource dan daftar yang menggunakan cache.
 * Format terpusat ini dipakai saat membaca maupun membatalkan cache.
 */
const cacheKeys = {
  /** @param {string} id id perusahaan */
  company: (id) => `companies:${id}`,
  /** @param {string} id id user */
  user: (id) => `users:${id}`,
  /** @param {string} id id lamaran */
  application: (id) => `applications:${id}`,
  /** @param {string} userId id user pemilik daftar lamaran */
  applicationsByUser: (userId) => `applications:user:${userId}`,
  /** @param {string} jobId id lowongan pemilik daftar lamaran */
  applicationsByJob: (jobId) => `applications:job:${jobId}`,
  /** @param {string} userId id user pemilik daftar bookmark */
  bookmarks: (userId) => `bookmarks:${userId}`,
};

module.exports = cacheKeys;
