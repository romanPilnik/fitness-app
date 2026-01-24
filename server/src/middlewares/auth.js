/**
 * @fileoverview JWT authentication middleware
 * @module middleware/auth
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT token verification middleware
 * Validates Bearer token from Authorization header and attaches user to request.
 * Requires active user account.
 *
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.headers - Request headers
 * @param {string} req.headers.authorization - Bearer token (format: "Bearer <token>")
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Calls next() on success, throws on failure
 * @throws {Error} 401 - Missing or invalid Authorization header
 * @throws {Error} 401 - Invalid or expired JWT token
 * @throws {Error} 401 - User not found or account inactive
 *
 * @example
 *  Protect route with authentication
 * router.get('/profile', verifyToken, getUserProfile);
 *
 * @example
 *  Access authenticated user in controller
 * const userId = req.user._id;
 * const userEmail = req.user.email;
 */

const verifyToken = async (req, res, next) => {
  // Get token from header
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('Token required');
    error.statusCode = 401;
    throw error;
  }

  // Extract token (remove "Bearer " prefix)
  const token = authHeader.substring(7);

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Get user from database (excluding password)
  const user = await User.findById(decoded.userId).select('-password');

  if (!user || !user.isActive) {
    const error = new Error('Invalid token');
    error.statusCode = 401;
    throw error;
  }

  // Attach user to request object
  req.user = user;
  next();
};

module.exports = { verifyToken };
