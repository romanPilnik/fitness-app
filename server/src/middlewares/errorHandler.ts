import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";
import {
  AppError,
  AuthenticationError,
  InternalServerError,
  ERROR_CODES,
} from "../errors/index";
import type { ZodValidationError } from "../types/error.types";

const isAppError = (err: unknown): err is AppError => {
  return err instanceof AppError;
};

const isZodValidationError = (err: unknown): err is ZodValidationError => {
  return (
    err instanceof Error &&
    "code" in err &&
    (err as { code: unknown }).code === "VALIDATION_ERROR" &&
    "issues" in err
  );
};

const isDevelopment = () => process.env.NODE_ENV === "development";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
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

  if (err.name === "JsonWebTokenError") {
    const authError = new AuthenticationError(
      "Invalid token",
      ERROR_CODES.INVALID_TOKEN,
    );
    const serialized = authError.serialize(isDevelopment());

    return sendError(
      res,
      serialized.statusCode,
      serialized.message,
      serialized.code,
    );
  }

  if (err.name === "TokenExpiredError") {
    const authError = new AuthenticationError(
      "Token has expired",
      ERROR_CODES.TOKEN_EXPIRED,
    );
    const serialized = authError.serialize(isDevelopment());

    return sendError(
      res,
      serialized.statusCode,
      serialized.message,
      serialized.code,
    );
  }

  if (isZodValidationError(err)) {
    return sendError(res, 400, err.message, "VALIDATION_ERROR", err.issues);
  }

  const internalError = new InternalServerError(
    err.message || "Internal server error",
    ERROR_CODES.INTERNAL_ERROR,
  );
  const serialized = internalError.serialize(isDevelopment());

  return sendError(
    res,
    serialized.statusCode,
    serialized.message,
    serialized.code,
  );
};
