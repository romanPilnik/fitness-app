/**
 * @fileoverview User profile routes for managing user account
 * @module routes/user
 */

const express = require("express");
const User = require("../models/User");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.use(verifyToken);

/**
 * GET /api/users/me
 * @route GET /me
 * @group User - User profile operations
 * @returns {Object} 200 - Current user profile
 * @returns {Object} 401 - Unauthorized
 */
router.get("/me", (req, res) => {
  res.status(200).json({
    message: "User retrieved",
    user: req.user,
  });
});

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
router.post("/change-password", async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  await User.changePassword(req.user._id, oldPassword, newPassword);

  res.json({ message: "Password changed successfully" });
});

module.exports = router;
