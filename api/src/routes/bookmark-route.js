/**
 * Route resource `bookmarks` (daftar bookmark milik user yang sedang login).
 * Bookmark per lowongan berada pada route `/jobs/:jobId/bookmark`.
 */
const express = require('express');
const authenticate = require('../middlewares/auth');
const bookmarkController = require('../controllers/bookmark-controller');

const router = express.Router();

router.get('/', authenticate, bookmarkController.getBookmarks);

module.exports = router;
