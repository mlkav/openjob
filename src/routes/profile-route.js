/**
 * Route resource `profile` (khusus user yang sedang login).
 */
const express = require('express');
const authenticate = require('../middlewares/auth');
const profileController = require('../controllers/profile-controller');

const router = express.Router();

router.get('/', authenticate, profileController.getProfile);
router.get('/applications', authenticate, profileController.getProfileApplications);
router.get('/bookmarks', authenticate, profileController.getProfileBookmarks);

module.exports = router;