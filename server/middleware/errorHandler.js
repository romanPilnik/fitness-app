function errorHandler(err, req, res, next) {
  console.log(err);

  // === VALIDATION ERROR ===
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors,
    });
  }

  // === CAST ERROR ===
  else if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // === JsonWebTokenError ===
  else if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  // === TokenExpiredError ===
  else if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // === Duplicate Value ===
  else if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];

    return res.status(409).json({
      success: false,
      message: `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } already exists`,
    });
  }

  // === DEFAULT ERROR ===
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  return res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = { errorHandler };
