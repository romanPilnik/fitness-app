const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyToken = async (req, res, next) => {
  // Get token from header
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("Token required");
    error.statusCode = 401;
    throw error;
  }

  // Extract token (remove "Bearer " prefix)
  const token = authHeader.substring(7);

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Get user from database (excluding password)
  const user = await User.findById(decoded.userId).select("-password");

  if (!user || !user.isActive) {
    const error = new Error("Invalid token");
    error.statusCode = 401;
    throw error;
  }

  // Attach user to request object
  req.user = user;
  next();
};

module.exports = { verifyToken };
