import * as z from "zod";
import { describe, expect, it } from "vitest";
import { AppError } from "./AppError.js";
import {
  AuthenticationError,
  AuthorizationError,
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from "./HttpErrors.js";
import { ERROR_CODES } from "../types/error.types.js";

describe("AppError", () => {
  it("sets statusCode, code, and default isOperational", () => {
    const err = new AppError("msg", 418, ERROR_CODES.INVALID_INPUT);
    expect(err.message).toBe("msg");
    expect(err.statusCode).toBe(418);
    expect(err.code).toBe(ERROR_CODES.INVALID_INPUT);
    expect(err.isOperational).toBe(true);
  });

  it("serialize omits stack by default", () => {
    const err = new AppError("m", 400, ERROR_CODES.INVALID_INPUT);
    const s = err.serialize(false);
    expect(s.stack).toBeUndefined();
    expect(s).toMatchObject({
      message: "m",
      code: ERROR_CODES.INVALID_INPUT,
      statusCode: 400,
    });
  });

  it("serialize includes stack when requested", () => {
    const err = new AppError("m", 500, ERROR_CODES.INTERNAL_ERROR);
    const s = err.serialize(true);
    expect(s.stack).toBeDefined();
  });
});

describe("ValidationError", () => {
  it("uses 400 and VALIDATION_ERROR", () => {
    const issues = z.string().safeParse(1);
    expect(issues.success).toBe(false);
    if (!issues.success) {
      const err = new ValidationError("Validation failed", issues.error.issues);
      expect(err.statusCode).toBe(400);
      expect(err.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    }
  });

  it("serialize attaches issues as details", () => {
    const issues = z.string().safeParse(null);
    expect(issues.success).toBe(false);
    if (!issues.success) {
      const err = new ValidationError("fail", issues.error.issues);
      const s = err.serialize();
      expect(s.details).toEqual(issues.error.issues);
    }
  });
});

describe("HTTP error subclasses", () => {
  it("AuthenticationError defaults", () => {
    const err = new AuthenticationError("bad");
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe(ERROR_CODES.INVALID_CREDENTIALS);
  });

  it("AuthenticationError accepts custom code", () => {
    const err = new AuthenticationError("expired", ERROR_CODES.TOKEN_EXPIRED);
    expect(err.code).toBe(ERROR_CODES.TOKEN_EXPIRED);
  });

  it("AuthorizationError defaults and override", () => {
    const a = new AuthorizationError("no");
    expect(a.statusCode).toBe(403);
    expect(a.code).toBe(ERROR_CODES.UNAUTHORIZED_ACCESS);
    const b = new AuthorizationError(
      "perm",
      ERROR_CODES.INSUFFICIENT_PERMISSIONS,
    );
    expect(b.code).toBe(ERROR_CODES.INSUFFICIENT_PERMISSIONS);
  });

  it("NotFoundError", () => {
    const err = new NotFoundError("missing");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe(ERROR_CODES.NOT_FOUND);
  });

  it("ConflictError", () => {
    const err = new ConflictError("dup");
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe(ERROR_CODES.DUPLICATE_VALUE);
  });

  it("BadRequestError", () => {
    const err = new BadRequestError("bad");
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe(ERROR_CODES.INVALID_INPUT);
  });

  it("InternalServerError is not operational", () => {
    const err = new InternalServerError("oops", ERROR_CODES.INTERNAL_ERROR);
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe(ERROR_CODES.INTERNAL_ERROR);
    expect(err.isOperational).toBe(false);
  });
});
