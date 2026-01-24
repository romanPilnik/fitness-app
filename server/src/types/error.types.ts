// ============================================================================
// ERROR CODES
// ============================================================================

/**
 * Centralized error codes registry
 * Used across all custom error classes for consistent error identification
 */
export const ERROR_CODES = {
  // ========== Validation ==========
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // ========== Authentication ==========
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_REQUIRED: 'TOKEN_REQUIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',

  // ========== Authorization ==========
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',

  // ========== Resources (Generic) ==========
  NOT_FOUND: 'NOT_FOUND',

  // ========== Resources (Specific) ==========
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EXERCISE_NOT_FOUND: 'EXERCISE_NOT_FOUND',
  PROGRAM_NOT_FOUND: 'PROGRAM_NOT_FOUND',
  PROGRAM_TEMPLATE_NOT_FOUND: 'PROGRAM_TEMPLATE_NOT_FOUND',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  EXERCISE_PROFILE_NOT_FOUND: 'EXERCISE_PROFILE_NOT_FOUND',

  // ========== Conflicts (Generic) ==========
  DUPLICATE_VALUE: 'DUPLICATE_VALUE',

  // ========== Conflicts (Specific) ==========
  EMAIL_TAKEN: 'EMAIL_TAKEN',
  NAME_ALREADY_EXISTS: 'NAME_ALREADY_EXISTS',
  EXERCISE_NAME_EXISTS: 'EXERCISE_NAME_EXISTS',
  PROGRAM_NAME_EXISTS: 'PROGRAM_NAME_EXISTS',
  TEMPLATE_NAME_EXISTS: 'TEMPLATE_NAME_EXISTS',

  // ========== Bad Requests ==========
  INVALID_INPUT: 'INVALID_INPUT',
  CAST_ERROR: 'CAST_ERROR',
  INVALID_STATUS: 'INVALID_STATUS',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  PASSWORD_MISMATCH: 'PASSWORD_MISMATCH',

  // ========== Server Errors ==========
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

// ============================================================================
// TYPES
// ============================================================================

/**
 * Union type of all error codes
 * Derived from ERROR_CODES constant for type safety
 */
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * Validation error detail for field-level validation failures
 * Used by Joi and Mongoose validation errors
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * Serialized error object for API responses
 * Consistent error format across all endpoints
 */
export interface SerializedError {
  message: string;
  code: ErrorCode;
  statusCode: number;
  details?: ValidationErrorDetail[] | unknown;
  stack?: string; // Only included in development environment
}

// ============================================================================
// EXTERNAL LIBRARY ERROR TYPES
// ============================================================================

export interface MongooseValidationError extends Error {
  name: 'ValidationError';
  errors: Record<string, { path: string; message: string }>;
}

export interface MongooseCastError extends Error {
  name: 'CastError';
  path: string;
  value: unknown;
}

export interface MongoDBDuplicateError extends Error {
  code: 11000;
  keyPattern: Record<string, unknown>;
}

export interface JoiValidationError extends Error {
  code: 'VALIDATION_ERROR';
  details: unknown;
}
