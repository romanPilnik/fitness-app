const User = require("../models/User");
const { sendSuccess } = require("../utils/response");
const userService = require("../services/user/user.service");

/**
 * @desc    Get current authenticated user
 * @route   GET /api/user/me
 * @access  Private
 * @param   {Object} req.user - Authenticated user object
 * @returns {Object} { success, message, data: user }
 */
const getCurrentUser = (req, res) => {
  sendSuccess(res, req.user, 200, "User retrieved");
};

/**
 * @desc    Update current authenticated user
 * @route   PUT /api/user/me
 * @access  Private
 * @param   {Object} req.user - Authenticated user object
 * @param   {Object} req.body - User data to update
 * @returns {Object} { success, message, data: user }
 * @throws  {400} Validation error
 */
const updateCurrentUser = async (req, res, next) => {
  try {
    const allowedUpdates = [
      "name",
      "preferences.units",
      "preferences.weekStartsOn",
    ];
    const updates = {};

    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await userService.updateCurrentUser(req.user._id, updates);
    sendSuccess(res, user, 200, "User updated");
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Change user password
 * @route   POST /api/user/change-password
 * @access  Private
 * @body    {string} req.body.oldPassword - Current password
 * @body    {string} req.body.newPassword - New password
 * @returns {Object} { success, message }
 * @throws  {401} Current password incorrect
 * @throws  {400} Validation error
 */
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    await User.changePassword(req.user._id, oldPassword, newPassword);
    sendSuccess(res, null, 200, "Password changed successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCurrentUser,
  changePassword,
  updateCurrentUser,
};
