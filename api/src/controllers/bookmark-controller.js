/**
 * Controller resource `bookmarks`.
 * Bookmark terikat pada user yang sedang login (`req.user.id`).
 */
const bookmarkService = require('../services/bookmark-service');
const { sendSuccess } = require('../utils/response');
const cacheService = require('../services/cache-service');
const cacheKeys = require('../utils/cache-keys');

/** POST /jobs/:jobId/bookmark */
const createBookmark = async (req, res, next) => {
  try {
    const id = await bookmarkService.addBookmark(req.user.id, req.params.jobId);

    return sendSuccess(res, {
      statusCode: 201,
      data: { id },
      message: 'Bookmark berhasil ditambahkan',
    });
  } catch (error) {
    return next(error);
  }
};

/** GET /bookmarks */
const getBookmarks = async (req, res, next) => {
  try {
    const result = await cacheService.remember(
      cacheKeys.bookmarks(req.user.id),
      () => bookmarkService.getBookmarksByUserId(req.user.id),
    );
    res.set('X-Data-Source', result.source);

    return sendSuccess(res, { data: { bookmarks: result.data } });
  } catch (error) {
    return next(error);
  }
};

/** GET /jobs/:jobId/bookmark/:id */
const getBookmarkById = async (req, res, next) => {
  try {
    const bookmark = await bookmarkService.getBookmarkByIdAndUser(
      req.params.id,
      req.params.jobId,
      req.user.id,
    );

    return sendSuccess(res, { data: bookmark });
  } catch (error) {
    return next(error);
  }
};

/** DELETE /jobs/:jobId/bookmark */
const deleteBookmark = async (req, res, next) => {
  try {
    await bookmarkService.deleteBookmark(req.user.id, req.params.jobId);

    return sendSuccess(res, { message: 'Bookmark berhasil dihapus' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createBookmark,
  getBookmarks,
  getBookmarkById,
  deleteBookmark,
};
