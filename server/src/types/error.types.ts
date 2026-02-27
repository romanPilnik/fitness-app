import type { z } from "zod";

export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",

  INVALID_TOKEN: "INVALID_TOKEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  TOKEN_REQUIRED: "TOKEN_REQUIRED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",

  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  UNAUTHORIZED_ACCESS: "UNAUTHORIZED_ACCESS",

  NOT_FOUND: "NOT_FOUND",

  USER_NOT_FOUND: "USER_NOT_FOUND",
  EXERCISE_NOT_FOUND: "EXERCISE_NOT_FOUND",
  PROGRAM_NOT_FOUND: "PROGRAM_NOT_FOUND",
  PROGRAM_TEMPLATE_NOT_FOUND: "PROGRAM_TEMPLATE_NOT_FOUND",
  SESSION_NOT_FOUND: "SESSION_NOT_FOUND",
  EXERCISE_PROFILE_NOT_FOUND: "EXERCISE_PROFILE_NOT_FOUND",

  DUPLICATE_VALUE: "DUPLICATE_VALUE",

  EMAIL_TAKEN: "EMAIL_TAKEN",
  NAME_ALREADY_EXISTS: "NAME_ALREADY_EXISTS",
  EXERCISE_NAME_EXISTS: "EXERCISE_NAME_EXISTS",
  PROGRAM_NAME_EXISTS: "PROGRAM_NAME_EXISTS",
  TEMPLATE_NAME_EXISTS: "TEMPLATE_NAME_EXISTS",

  INVALID_INPUT: "INVALID_INPUT",
  CAST_ERROR: "CAST_ERROR",
  INVALID_STATUS: "INVALID_STATUS",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",
  PASSWORD_MISMATCH: "PASSWORD_MISMATCH",

  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export type ZodIssue = z.core.$ZodIssue;
export interface ZodValidationError extends Error {
  code: "VALIDATION_ERROR";
  issues: ZodIssue[];
}
export interface SerializedError {
  message: string;
  code: ErrorCode;
  statusCode: number;
  details?: ValidationErrorDetail[];
  stack?: string;
}
export interface MongooseValidationError extends Error {
  name: "ValidationError";
  errors: Record<string, { path: string; message: string }>;
}

export interface MongooseCastError extends Error {
  name: "CastError";
  path: string;
  value: unknown;
}

export interface MongoDBDuplicateError extends Error {
  code: 11000;
  keyPattern: Record<string, unknown>;
}
