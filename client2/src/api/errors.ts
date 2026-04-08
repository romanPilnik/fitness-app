import type { ApiErrorBody } from './types';

export class ApiError extends Error {
  readonly code: string;
  readonly details?: unknown;
  readonly status?: number;

  constructor(
    message: string,
    code: string,
    options?: { details?: unknown; status?: number; cause?: unknown },
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = 'ApiError';
    this.code = code;
    this.details = options?.details;
    this.status = options?.status;
  }

  static fromBody(body: ApiErrorBody, status?: number): ApiError {
    return new ApiError(body.error.message, body.error.code, {
      details: body.error.details,
      status,
    });
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (!isRecord(value) || value.success !== false) return false;
  const err = value.error;
  if (!isRecord(err)) return false;
  return typeof err.message === 'string' && typeof err.code === 'string';
}

export function tryParseApiErrorBody(value: unknown, status?: number): ApiError | null {
  if (!isApiErrorBody(value)) return null;
  return ApiError.fromBody(value, status);
}
