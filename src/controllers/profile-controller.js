/**
 * Controller resource `profile`.
 * Seluruh endpoint di sini hanya mengembalikan data milik user yang sedang
 * login (id diambil dari access token, bukan dari parameter request).
 */
const profileService = require('../services/profile-service');
const { sendSuccess } = require('../utils/response');

/** GET /profile */
const getProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.user.id);

    return sendSuccess(res, { data: profile });
  } catch (error) {
    return next(error);
  }
};

/** GET /profile/applications */
const getProfileApplications = async (req, res, next) => {
  try {
    const applications = await profileService.getProfileApplications(req.user.id);

    return sendSuccess(res, { data: { applications } });
  } catch (error) {
    return next(error);
  }
};

/** GET /profile/bookmarks */
const getProfileBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await profileService.getProfileBookmarks(req.user.id);

    return sendSuccess(res, { data: { bookmarks } });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getProfile, getProfileApplications, getProfileBookmarks };