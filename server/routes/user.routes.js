/**
 * @fileoverview User profile routes for managing user account
 * @module routes/user
 */

const express = require('express');
const { verifyToken } = require('../middlewares/auth');
const userController = require('../controllers/user.controller');
const validate = require('../middlewares/validate');
const userValidation = require('../validations/user.validation');
const userRouter = express.Router();

/**
 * GET /api/users/me
 * @route GET /me
 * @group User - User profile operations
 * @returns {Object} 200 - Current user profile
 * @returns {Object} 401 - Unauthorized
 */
userRouter.get('/me', verifyToken, userController.getCurrentUser);

/**
 * PATCH /api/users/me
 * @route PATCH /me
 * @group User - User profile operations
 * @param {String} name.body.optional - User's name
 * @param {String} preferences.units.body.optional - User's preferred units
 * @param {String} preferences.weekStartsOn.body.optional -  User's preferred week start day
 * @returns {Object} 200 - User profile updated successfully
 * @returns {Object} 400 - Validation error
 * @returns {Object} 401 - Unauthorized
 */
userRouter.patch(
  '/me',
  verifyToken,
  validate(userValidation.updateUser),
  userController.updateCurrentUser,
);

/**
 * POST /api/users/change-password
 * @route POST /change-password
 * @group User - User profile operations
 * @param {string} oldPassword.body.required - Current password
 * @param {string} newPassword.body.required - New password
 * @returns {Object} 200 - Password changed successfully
 * @returns {Object} 400 - Validation error
 * @returns {Object} 401 - Unauthorized or incorrect old password
 */
userRouter.post(
  '/change-password',
  verifyToken,
  validate(userValidation.changePassword),
  userController.changePassword,
);

module.exports = userRouter;
