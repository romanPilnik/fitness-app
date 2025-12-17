const { sendError } = require('../utils/response');

/**
 * Centralized error handling middleware
 * Transforms various error types into consistent JSON responses.
 * Handles Mongoose validation/cast errors, JWT errors, MongoDB duplicates, and custom errors.
 *
 * @param {Error} err - Error object to handle
 * @param {Object} err.name - Error type name (ValidationError, CastError, JsonWebTokenError, etc.)
 * @param {number} [err.statusCode] - HTTP status code (defaults to 500)
 * @param {string} [err.message] - Error message
 * @param {number} [err.code] - MongoDB error code (11000 for duplicates)
 * @param {Object} _req - Express request object (unused)
 * @param {Object} res - Express response object
 * @param {Function} _next - Express next middleware function (unused)
 * @returns {Object} JSON response with { success: false, message, errors? }
 *
 * @example
 * Use as last middleware in Express app
 * app.use(errorHandler);
 *
 * @example
 * Trigger from controller
 * const error = new Error("Resource not found");
 * error.statusCode = 404;
 * next(error);
 */

const errorHandler = (err, _req, res, _next) => {
  console.log(err);

  // === JOI VALIDATION ERROR ===
  if (err.code === 'VALIDATION_ERROR' && err.details) {
    return sendError(res, 400, err.message, 'VALIDATION_ERROR', err.details);
  }

  // === MONGOOSE VALIDATION ERROR ===
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, 400, 'Validation failed', 'VALIDATION_ERROR', errors);
  }

  // === CAST ERROR ===
  else if (err.name === 'CastError') {
    return sendError(res, 400, `Invalid ${err.path}: ${err.value}`, 'CAST_ERROR');
  }

  // === JsonWebTokenError ===
  else if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token', 'INVALID_TOKEN');
  }

  // === TokenExpiredError ===
  else if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Token has expired', 'TOKEN_EXPIRED');
  }

  // === Duplicate Value ===
  else if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];

    return sendError(res, 409, `Duplicate value for field: ${field}`, 'DUPLICATE_VALUE');
  }

  // === DEFAULT ERROR ===
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const code = err.code || 'ERROR';

  return sendError(res, statusCode, message, code);
};

module.exports = errorHandler;
