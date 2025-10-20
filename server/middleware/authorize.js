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
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }
    next();
  };
}

module.exports = { requireRole };
