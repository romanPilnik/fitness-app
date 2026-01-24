import type { ErrorCode, SerializedError } from '../types/error.types.js';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, code: ErrorCode, isOperational = true) {
    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, new.target.prototype);
  }

  serialize(includeStack = false): SerializedError {
    const serialized: SerializedError = {
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
    };

    if (includeStack && this.stack) {
      serialized.stack = this.stack;
    }

    return serialized;
  }
}
