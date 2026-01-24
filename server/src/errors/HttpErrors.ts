import { AppError } from './AppError.js';
import { ERROR_CODES, type ErrorCode, type ValidationErrorDetail } from '../types/error.types.js';

export class ValidationError extends AppError {
  public readonly details?: ValidationErrorDetail[];

  constructor(message: string, details?: ValidationErrorDetail[]) {
    super(message, 400, ERROR_CODES.VALIDATION_ERROR);
    if (details) {
      this.details = details;
    }
  }

  serialize(includeStack = false) {
    const serialized = super.serialize(includeStack);
    if (this.details) {
      serialized.details = this.details;
    }
    return serialized;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, code: ErrorCode = ERROR_CODES.INVALID_CREDENTIALS) {
    super(message, 401, code);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string, code: ErrorCode = ERROR_CODES.UNAUTHORIZED_ACCESS) {
    super(message, 403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, code: ErrorCode = ERROR_CODES.NOT_FOUND) {
    super(message, 404, code);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code: ErrorCode = ERROR_CODES.DUPLICATE_VALUE) {
    super(message, 409, code);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, code: ErrorCode = ERROR_CODES.INVALID_INPUT) {
    super(message, 400, code);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string, code: ErrorCode = ERROR_CODES.INTERNAL_ERROR) {
    super(message, 500, code, false);
  }
}
