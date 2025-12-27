const User = require('../../models/User');

/**
 * Registers a new user in the database
 * @param {string} email - User's email address
 * @param {string} password - User's plain text password (will be hashed by model)
 * @param {string} name - User's full name
 * @returns {Promise<Object>} The saved user document
 * @throws {Error} 409 - If user with email already exists
 * @throws {Error} Mongoose validation errors if data is invalid
 */
const registerUser = async (email, password, name) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error('Email is taken');
    error.statusCode = 409;
    throw error;
  }

  const newUser = new User({
    email,
    password,
    name,
  });
  const savedUser = await newUser.save();
  return savedUser;
};

/**
 * Authenticates a user with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's plain text password
 * @returns {Promise<Object>} User document without password field
 * @throws {Error} 401 - If email not found or password is incorrect
 */
const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = {
  registerUser,
  loginUser,
};
