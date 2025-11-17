const authService = require('../services/auth/auth.service');
const { sendSuccess } = require('../utils/response');
const tokenService = require('../services/auth/token.service');

/**
 * Handles user registration HTTP request
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @param {string} req.body.name - User's full name
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Sends JSON response with token and user data
 * @description Creates a new user account and returns JWT token
 */
const registerUser = async (req, res) => {
  const { email, password, name } = req.body;
  const user = await authService.registerUser(email, password, name);
  const token = tokenService.generateAuthToken(user._id);

  return sendSuccess(
    res,
    {
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    },
    201,
    'User created successfully',
  );
};

/**
 * Handles user login HTTP request
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Sends JSON response with token and user data
 * @description Authenticates user and returns JWT token
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUser(email, password);
  const token = tokenService.generateAuthToken(user._id);

  return sendSuccess(
    res,
    {
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    },
    200,
    'User logged in successfully',
  );
};

module.exports = {
  registerUser,
  loginUser,
};
