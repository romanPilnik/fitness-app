const User = require("../../models/User");

/**
 * Update user profile
 *
 * @param {mongoose.Types.ObjectId} userId - User's ID
 * @param {Object} updates - Fields to update
 * @param {string} [updates.name] - Updated name
 * @param {Object} [updates.preferences] - Preference updates
 * @returns {Promise<User>} Updated user document
 * @throws {Error} 400 - No fields to update
 * @throws {Error} 404 - User not found
 * @throws {ValidationError} Invalid data
 */
const updateCurrentUser = async (userId, updates) => {
  if (!updates || Object.keys(updates).length === 0) {
    const error = new Error("No fields to update");
    error.statusCode = 400;
    throw error;
  }
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  ).select("-password -__v");
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

module.exports = { updateCurrentUser };
