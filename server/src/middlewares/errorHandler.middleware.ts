import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";
import {
  AppError,
  InternalServerError,
  ERROR_CODES,
  ConflictError,
  NotFoundError,
  BadRequestError,
} from "../errors/index";
import logger from "../utils/logger";
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/client";

const isAppError = (err: unknown): err is AppError => {
  return err instanceof AppError;
};

const isDevelopment = () => process.env.NODE_ENV === "development";

function mapPrismaError(err: unknown): AppError | null {
  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return new ConflictError("Already exists", ERROR_CODES.DUPLICATE_VALUE);
      case "P2025":
        return new NotFoundError("Not found", ERROR_CODES.NOT_FOUND);
      case "P2003":
        return new BadRequestError("Bad request", ERROR_CODES.INVALID_INPUT);
    }
  }
  if (err instanceof PrismaClientValidationError) {
    return new AppError(
      "Validation error",
      500,
      ERROR_CODES.INTERNAL_ERROR,
      false,
    );
  }
  if (err instanceof PrismaClientInitializationError) {
    return new AppError(
      "Database Error",
      500,
      ERROR_CODES.INTERNAL_ERROR,
      false,
    );
  }
  return null;
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const prismaError = mapPrismaError(err);
  if (prismaError) {
    err = prismaError;
  }
  if (isAppError(err) && err.isOperational) {
    const includeStack = isDevelopment();
    const serialized = err.serialize(includeStack);
    logger.warn(err);

    return sendError(
      res,
      serialized.statusCode,
      serialized.message,
      serialized.code,
      serialized.details,
    );
  }

  if (isAppError(err) && !err.isOperational) {
    const serialized = err.serialize(isDevelopment());
    logger.error(err);
    return sendError(
      res,
      serialized.statusCode,
      serialized.message,
      serialized.code,
    );
  }

  const internalError = new InternalServerError(
    err.message || "An unexpected error occurred",
    ERROR_CODES.INTERNAL_ERROR,
  );
  const serialized = internalError.serialize(isDevelopment());
  logger.error(err);
  return sendError(
    res,
    serialized.statusCode,
    serialized.message,
    serialized.code,
  );
};
