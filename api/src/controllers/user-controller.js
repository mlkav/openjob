/**
 * Controller resource `users`.
 */
const userService = require('../services/user-service');
const { sendSuccess } = require('../utils/response');
const cacheService = require('../services/cache-service');
const cacheKeys = require('../utils/cache-keys');

/** POST /users */
const createUser = async (req, res, next) => {
  try {
    const id = await userService.addUser(req.body);

    return sendSuccess(res, {
      statusCode: 201,
      data: { id },
      message: 'User berhasil ditambahkan',
    });
  } catch (error) {
    return next(error);
  }
};

/** GET /users/:id */
const getUserById = async (req, res, next) => {
  try {
    const result = await cacheService.remember(
      cacheKeys.user(req.params.id),
      () => userService.getUserById(req.params.id),
    );
    res.set('X-Data-Source', result.source);

    return sendSuccess(res, { data: result.data });
  } catch (error) {
    return next(error);
  }
};

/** PUT /users/:id */
const editUserById = async (req, res, next) => {
  try {
    await userService.editUserById(req.params.id, req.body, req.user);
    return sendSuccess(res, { message: 'User berhasil diperbarui' });
  } catch (error) {
    return next(error);
  }
};

module.exports = { createUser, getUserById, editUserById };
