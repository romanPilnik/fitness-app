/**
 * Resource ownership verification middleware
 * Checks if authenticated user owns the requested resource
 *
 * @param {Model} Model - Mongoose model to query
 * @param {string} foreignKey - Field name that stores the owner's ID (default: "userId")
 * @returns {Function} Express middleware function
 *
 * @example
 * router.patch('/programs/:id', verifyToken, verifyOwnership(UserProgram), controller)
 */

const verifyOwnership = (Model, foreignKey = "userId") => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }
      const resource = await Model.findById(req, params.id);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: "Resource not found",
        });
      }

      const ownerId = resource[foreignKey].toString();
      const userId = req.user._id.toString();

      if (ownerId !== userId) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to access this resource",
        });
      }

      req.resource = resource;

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Unexpected server error",
      });
    }
  };
};

module.exports = { verifyOwnership };
