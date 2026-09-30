/**
 * Controller resource `users`.
 */
const userService = require('../services/user-service');
const { sendSuccess } = require('../utils/response');

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
    const user = await userService.getUserById(req.params.id);

    return sendSuccess(res, { data: user });
  } catch (error) {
    return next(error);
  }
};

module.exports = { createUser, getUserById };