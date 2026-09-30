/**
 * Pengumpul seluruh route aplikasi.
 */
const express = require('express');
const userRoute = require('./user-route');
const companyRoute = require('./company-route');
const categoryRoute = require('./category-route');
const jobRoute = require('./job-route');
const applicationRoute = require('./application-route');
const bookmarkRoute = require('./bookmark-route');
const authenticationRoute = require('./authentication-route');
const profileRoute = require('./profile-route');

const router = express.Router();

router.use('/users', userRoute);
router.use('/companies', companyRoute);
router.use('/categories', categoryRoute);
router.use('/jobs', jobRoute);
router.use('/applications', applicationRoute);
router.use('/bookmarks', bookmarkRoute);
router.use('/authentications', authenticationRoute);
router.use('/profile', profileRoute);

module.exports = router;