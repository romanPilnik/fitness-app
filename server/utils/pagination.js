/**
 * Pagination utilities for consistent pagination handling
 */

/**
 * Parse and validate pagination parameters from request query
 * @param {Object} query - req.query object
 * @param {Number} defaultLimit - Default items per page (default: 20)
 * @param {Number} maxLimit - Maximum allowed items per page (default: 100)
 * @returns {Object} { page, limit, skip }
 */
const parsePaginationParams = (query, defaultLimit = 20, maxLimit = 100) => {
  let page = parseInt(query.page) || 1;
  let limit = parseInt(query.limit) || defaultLimit;

  // Validation
  if (page < 1) page = 1;
  if (limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Calculate pagination metadata for response
 * @param {Number} page - Current page number
 * @param {Number} limit - Items per page
 * @param {Number} total - Total number of items in database
 * @returns {Object} Pagination metadata
 */
const calculatePagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };
};

module.exports = {
  parsePaginationParams,
  calculatePagination,
};
