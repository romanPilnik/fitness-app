/**
 * Role-based authorization middleware
 * Checks if authenticated user has required role(s)
 *
 * @param {...string} allowedRoles - One or more role names that can access the route
 * @returns {Function} Express middleware function
 *
 * @example
 * router.post('/admin', verifyToken, requireRole('admin'), controller)
 * router.get('/data', verifyToken, requireRole('admin', 'moderator'), controller)
 */

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error("Authentication required");
      error.statusCode = 401;
      throw error;
    }

    if (!allowedRoles.includes(req.user.role)) {
      const error = new Error("Insufficient permissions");
      error.statusCode = 403;
      throw error;
    }

    next();
  };
}

module.exports = { requireRole };
