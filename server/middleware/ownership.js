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
    if (!req.user) {
      const error = new Error("Authentication required");
      error.statusCode = 401;
      throw error;
    }
    const resource = await Model.findById(req.params.id);

    if (!resource) {
      const error = new Error("Resource not found");
      error.statusCode = 404;
      throw error;
    }

    const ownerId = resource[foreignKey].toString();
    const userId = req.user._id.toString();

    if (ownerId !== userId) {
      const error = new Error("Not authorized to access this resource");
      error.statusCode = 403;
      throw error;
    }

    req.resource = resource;

    next();
  };
};

module.exports = { verifyOwnership };
