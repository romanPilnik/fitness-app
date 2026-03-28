import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/errors/AppError.js";
import { ERROR_CODES } from "@/types/error.types.js";

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
  },
}));
vi.mock("@/lib/prisma.js", () => ({ prisma: prismaMock }));

import { verifyToken } from "../auth.middleware.js";

function mockAuthReq(authorization: string | undefined): Request {
  return {
    header: (name: string) =>
      name.toLowerCase() === "authorization" ? authorization : undefined,
  } as Request;
}

const userRow = {
  id: "u-1",
  email: "a@b.com",
  name: "Test",
  role: "user",
  isActive: true,
  units: "metric",
  weekStartsOn: "sunday",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("verifyToken", () => {
  let prevJwtSecret: string | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    prevJwtSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = "middleware-unit-test-secret";
  });

  afterEach(() => {
    process.env.JWT_SECRET = prevJwtSecret;
    vi.restoreAllMocks();
  });

  it("calls next with TOKEN_REQUIRED when Authorization is missing", async () => {
    const req = mockAuthReq(undefined);
    const next = vi.fn();

    await verifyToken(req, {} as Response, next as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0]?.[0] as AppError;
    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe(ERROR_CODES.TOKEN_REQUIRED);
    expect(err.statusCode).toBe(401);
  });

  it("calls next with TOKEN_REQUIRED when header is not Bearer", async () => {
    const req = mockAuthReq("Basic abc");
    const next = vi.fn();

    await verifyToken(req, {} as Response, next as NextFunction);

    const err = next.mock.calls[0]?.[0] as AppError;
    expect(err.code).toBe(ERROR_CODES.TOKEN_REQUIRED);
  });

  it("calls next with TOKEN_REQUIRED when Bearer token is empty", async () => {
    const req = mockAuthReq("Bearer ");
    const next = vi.fn();

    await verifyToken(req, {} as Response, next as NextFunction);

    const err = next.mock.calls[0]?.[0] as AppError;
    expect(err.code).toBe(ERROR_CODES.TOKEN_REQUIRED);
  });

  it("calls next with INTERNAL_ERROR when JWT_SECRET is unset", async () => {
    delete process.env.JWT_SECRET;
    const token = jwt.sign({ userId: "u-1" }, "any", { algorithm: "HS256" });
    const req = mockAuthReq(`Bearer ${token}`);
    const next = vi.fn();

    await verifyToken(req, {} as Response, next as NextFunction);

    const err = next.mock.calls[0]?.[0] as AppError;
    expect(err.code).toBe(ERROR_CODES.INTERNAL_ERROR);
    expect(err.statusCode).toBe(500);
  });

  it("calls next with TOKEN_EXPIRED when jwt.verify throws TokenExpiredError", async () => {
    vi.spyOn(jwt, "verify").mockImplementation(() => {
      throw new jwt.TokenExpiredError("jwt expired", new Date());
    });
    const req = mockAuthReq("Bearer any.token.here");
    const next = vi.fn();

    await verifyToken(req, {} as Response, next as NextFunction);

    const err = next.mock.calls[0]?.[0] as AppError;
    expect(err.code).toBe(ERROR_CODES.TOKEN_EXPIRED);
  });

  it("calls next with INVALID_TOKEN when jwt.verify throws JsonWebTokenError", async () => {
    vi.spyOn(jwt, "verify").mockImplementation(() => {
      throw new jwt.JsonWebTokenError("invalid signature");
    });
    const req = mockAuthReq("Bearer x.y.z");
    const next = vi.fn();

    await verifyToken(req, {} as Response, next as NextFunction);

    const err = next.mock.calls[0]?.[0] as AppError;
    expect(err.code).toBe(ERROR_CODES.INVALID_TOKEN);
  });

  it("forwards non-JWT verify errors to next unchanged", async () => {
    const boom = new Error("unexpected verify failure");
    vi.spyOn(jwt, "verify").mockImplementation(() => {
      throw boom;
    });
    const req = mockAuthReq("Bearer a.b.c");
    const next = vi.fn();

    await verifyToken(req, {} as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(boom);
  });

  it("calls next with INVALID_TOKEN when payload has no userId", async () => {
    vi.spyOn(jwt, "verify").mockImplementation(
      () =>
        ({
          sub: "not-userId",
        }) as jwt.JwtPayload,
    );
    const req = mockAuthReq("Bearer looks.valid");
    const next = vi.fn();

    await verifyToken(req, {} as Response, next as NextFunction);

    const err = next.mock.calls[0]?.[0] as AppError;
    expect(err.message).toBe("Invalid token payload");
    expect(err.code).toBe(ERROR_CODES.INVALID_TOKEN);
  });

  it("calls next with INVALID_TOKEN when user no longer exists", async () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET must be set");
    }
    const token = jwt.sign({ userId: "u-gone" }, secret, {
      algorithm: "HS256",
    });
    prismaMock.user.findUnique.mockResolvedValue(null);
    const req = mockAuthReq(`Bearer ${token}`);
    const next = vi.fn();

    await verifyToken(req, {} as Response, next as NextFunction);

    const err = next.mock.calls[0]?.[0] as AppError;
    expect(err.message).toBe("User not found");
    expect(err.code).toBe(ERROR_CODES.INVALID_TOKEN);
  });

  it("calls next with UNAUTHORIZED_ACCESS when account is inactive", async () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET must be set");
    }
    const token = jwt.sign({ userId: "u-1" }, secret, {
      algorithm: "HS256",
    });
    prismaMock.user.findUnique.mockResolvedValue({
      ...userRow,
      isActive: false,
    });
    const req = mockAuthReq(`Bearer ${token}`);
    const next = vi.fn();

    await verifyToken(req, {} as Response, next as NextFunction);

    const err = next.mock.calls[0]?.[0] as AppError;
    expect(err.message).toBe("Account deactivated");
    expect(err.code).toBe(ERROR_CODES.UNAUTHORIZED_ACCESS);
  });

  it("sets req.user and calls next() on success", async () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET must be set");
    }
    const token = jwt.sign({ userId: "u-1" }, secret, {
      algorithm: "HS256",
    });
    prismaMock.user.findUnique.mockResolvedValue({ ...userRow });
    const req = mockAuthReq(`Bearer ${token}`);
    const next = vi.fn();

    await verifyToken(req, {} as Response, next as NextFunction);

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: "u-1" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        units: true,
        weekStartsOn: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    expect(req.user).toEqual(userRow);
    expect(next).toHaveBeenCalledWith();
  });
});
