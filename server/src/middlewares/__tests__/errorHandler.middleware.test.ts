import type { NextFunction, Request, Response } from "express";
import * as z from "zod";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  InternalServerError,
  NotFoundError,
  ValidationError,
} from "@/errors/index.js";
import { ERROR_CODES } from "@/types/error.types.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

const sendErrorMock = vi.hoisted(() => vi.fn());
const loggerWarnMock = vi.hoisted(() => vi.fn());
const loggerErrorMock = vi.hoisted(() => vi.fn());

vi.mock("../../utils/response.js", () => ({
  sendError: sendErrorMock,
}));

vi.mock("../../utils/logger.js", () => ({
  default: {
    warn: loggerWarnMock,
    error: loggerErrorMock,
  },
}));

import { errorHandler } from "../errorHandler.middleware.js";

describe("errorHandler", () => {
  const res = {} as Response;
  const req = {} as Request;
  const next = vi.fn() as NextFunction;

  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "test");
    sendErrorMock.mockClear();
    loggerWarnMock.mockClear();
    loggerErrorMock.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sends operational AppError via sendError and logs warn", () => {
    const err = new NotFoundError("gone", ERROR_CODES.NOT_FOUND);

    errorHandler(err, req, res, next);

    expect(loggerWarnMock).toHaveBeenCalledWith(err);
    expect(loggerErrorMock).not.toHaveBeenCalled();
    expect(sendErrorMock).toHaveBeenCalledWith(
      res,
      404,
      "gone",
      ERROR_CODES.NOT_FOUND,
      undefined,
    );
  });

  it("passes ValidationError details to sendError", () => {
    const parsed = z.string().safeParse(1);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const err = new ValidationError("Validation failed", parsed.error.issues);

      errorHandler(err, req, res, next);

      expect(sendErrorMock).toHaveBeenCalledWith(
        res,
        400,
        "Validation failed",
        ERROR_CODES.VALIDATION_ERROR,
        parsed.error.issues,
      );
    }
  });

  it("sends non-operational AppError with logger.error and omits details arg", () => {
    const err = new InternalServerError("boom", ERROR_CODES.INTERNAL_ERROR);

    errorHandler(err, req, res, next);

    expect(loggerErrorMock).toHaveBeenCalledWith(err);
    expect(sendErrorMock).toHaveBeenCalledWith(
      res,
      500,
      "boom",
      ERROR_CODES.INTERNAL_ERROR,
    );
  });

  it("wraps plain Error as InternalServerError", () => {
    const err = new Error("unexpected");

    errorHandler(err, req, res, next);

    expect(loggerErrorMock).toHaveBeenCalledWith(err);
    expect(sendErrorMock).toHaveBeenCalledWith(
      res,
      500,
      "unexpected",
      ERROR_CODES.INTERNAL_ERROR,
    );
  });

  it("uses default message when plain Error has empty message", () => {
    const err = new Error("");

    errorHandler(err, req, res, next);

    expect(sendErrorMock).toHaveBeenCalledWith(
      res,
      500,
      "An unexpected error occurred",
      ERROR_CODES.INTERNAL_ERROR,
    );
  });

  it("maps Prisma P2002 to ConflictError response", () => {
    const err = new PrismaClientKnownRequestError("duplicate", {
      code: "P2002",
      clientVersion: "test",
    });

    errorHandler(err, req, res, next);

    expect(sendErrorMock).toHaveBeenCalledWith(
      res,
      409,
      "Already exists",
      ERROR_CODES.DUPLICATE_VALUE,
      undefined,
    );
    expect(loggerWarnMock).toHaveBeenCalled();
  });

  it("maps Prisma P2025 to NotFoundError response", () => {
    const err = new PrismaClientKnownRequestError("not found", {
      code: "P2025",
      clientVersion: "test",
    });

    errorHandler(err, req, res, next);

    expect(sendErrorMock).toHaveBeenCalledWith(
      res,
      404,
      "Not found",
      ERROR_CODES.NOT_FOUND,
      undefined,
    );
  });

  it("maps Prisma P2003 to BadRequestError response", () => {
    const err = new PrismaClientKnownRequestError("fk", {
      code: "P2003",
      clientVersion: "test",
    });

    errorHandler(err, req, res, next);

    expect(sendErrorMock).toHaveBeenCalledWith(
      res,
      400,
      "Bad request",
      ERROR_CODES.INVALID_INPUT,
      undefined,
    );
  });
});
