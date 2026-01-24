import type { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  BadRequestError,
  ConflictError,
  InternalServerError,
  ERROR_CODES,
} from '../errors/index.js';
import type {
  MongooseValidationError,
  MongooseCastError,
  MongoDBDuplicateError,
  JoiValidationError,
} from '../types/error.types.js';

const isAppError = (err: unknown): err is AppError => {
  return err instanceof AppError;
};

const isMongooseValidationError = (err: unknown): err is MongooseValidationError => {
  return err instanceof Error && err.name === 'ValidationError' && 'errors' in err;
};

const isMongooseCastError = (err: unknown): err is MongooseCastError => {
  return err instanceof Error && err.name === 'CastError' && 'path' in err && 'value' in err;
};

const isMongoDBDuplicateError = (err: unknown): err is MongoDBDuplicateError => {
  return (
    err instanceof Error &&
    'code' in err &&
    (err as { code: unknown }).code === 11000 &&
    'keyPattern' in err
  );
};

const isJoiValidationError = (err: unknown): err is JoiValidationError => {
  return (
    err instanceof Error &&
    'code' in err &&
    (err as { code: unknown }).code === 'VALIDATION_ERROR' &&
    'details' in err
  );
};

const isDevelopment = () => process.env.NODE_ENV === 'development';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.log(err);

  if (isAppError(err)) {
    const includeStack = isDevelopment();
    const serialized = err.serialize(includeStack);

    return sendError(
      res,
      serialized.statusCode,
      serialized.message,
      serialized.code,
      serialized.details,
    );
  }

  if (isMongooseValidationError(err)) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    const validationError = new ValidationError('Validation failed', errors);
    const serialized = validationError.serialize(isDevelopment());

    return sendError(
      res,
      serialized.statusCode,
      serialized.message,
      serialized.code,
      serialized.details,
    );
  }

  if (isMongooseCastError(err)) {
    const castError = new BadRequestError(
      `Invalid ${err.path}: ${err.value}`,
      ERROR_CODES.CAST_ERROR,
    );
    const serialized = castError.serialize(isDevelopment());

    return sendError(res, serialized.statusCode, serialized.message, serialized.code);
  }

  if (err.name === 'JsonWebTokenError') {
    const authError = new AuthenticationError('Invalid token', ERROR_CODES.INVALID_TOKEN);
    const serialized = authError.serialize(isDevelopment());

    return sendError(res, serialized.statusCode, serialized.message, serialized.code);
  }

  if (err.name === 'TokenExpiredError') {
    const authError = new AuthenticationError('Token has expired', ERROR_CODES.TOKEN_EXPIRED);
    const serialized = authError.serialize(isDevelopment());

    return sendError(res, serialized.statusCode, serialized.message, serialized.code);
  }

  if (isMongoDBDuplicateError(err)) {
    const field = Object.keys(err.keyPattern)[0];
    const conflictError = new ConflictError(
      `Duplicate value for field: ${field}`,
      ERROR_CODES.DUPLICATE_VALUE,
    );
    const serialized = conflictError.serialize(isDevelopment());

    return sendError(res, serialized.statusCode, serialized.message, serialized.code);
  }

  if (isJoiValidationError(err)) {
    return sendError(res, 400, err.message, 'VALIDATION_ERROR', err.details);
  }

  const internalError = new InternalServerError(
    err.message || 'Internal server error',
    ERROR_CODES.INTERNAL_ERROR,
  );
  const serialized = internalError.serialize(isDevelopment());

  return sendError(res, serialized.statusCode, serialized.message, serialized.code);
};
