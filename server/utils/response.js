/**
 * Standardized API response utilities
 * Ensures consistent response format across all endpoints
 */

/**
 * Send successful response
 * @param {Object} res - Express response object
 * @param {*} data - Response payload
 * @param {Number} statusCode - HTTP status code (default: 200)
 * @param {String} message - Optional success message
 */
const sendSuccess = (res, data, statusCode = 200, message = null) => {
  if (statusCode === 204) {
    return res.status(204).send();
  }
  const response = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code (default: 500)
 * @param {String} message - Human-readable error message
 * @param {String} code - Machine-readable error code (default: "ERROR")
 * @param {Object} details - Additional error details (validation errors, etc.)
 */
const sendError = (res, statusCode = 500, message = null, code = 'ERROR', details = null) => {
  const response = {
    success: false,
    error: {
      message,
      code,
    },
  };

  if (details) {
    response.error.details = details;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items for current page
 * @param {Object} pagination - Pagination metadata from calculatePagination()
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
const sendPaginated = (res, data, pagination, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    pagination,
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated,
};
