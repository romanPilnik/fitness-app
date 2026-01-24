import { type Response } from 'express';
import type { ApiSuccess, ApiError } from '../types/api.types.js';

function sendSuccess<T>(res: Response, data: T, statusCode = 200, message?: string): Response {
  if (statusCode === 204) {
    return res.status(204).send();
  }

  const response: ApiSuccess<T> = {
    success: true,
    data,
    ...(message && { message }),
  };

  return res.status(statusCode).json(response);
}

function sendError(
  res: Response,
  statusCode = 500,
  message: string,
  code = 'ERROR',
  details?: unknown,
): Response {
  const response: ApiError = {
    success: false,
    error: {
      message,
      code,
    },
  };
  if (details !== undefined) {
    response.error.details = details;
  }

  return res.status(statusCode).json(response);
}

export { sendSuccess, sendError };
