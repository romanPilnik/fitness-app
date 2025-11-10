/**
 * @fileoverview User profile routes for managing user account
 * @module routes/user
 */

const express = require("express");
const { verifyToken } = require("../middleware/auth");
const userController = require("../controllers/user.controller");

const router = express.Router();

/**
 * GET /api/users/me
 * @route GET /me
 * @group User - User profile operations
 * @returns {Object} 200 - Current user profile
 * @returns {Object} 401 - Unauthorized
 */
router.get("/me", verifyToken, userController.getCurrentUser);

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
router.patch("/me", verifyToken, userController.updateCurrentUser);

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
router.post("/change-password", verifyToken, userController.changePassword);

module.exports = router;
