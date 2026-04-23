import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { AuthenticationError, AuthorizationError } from "@/errors/index.js";
import { ERROR_CODES } from "@/types/error.types.js";
import { Role, Units, WeekStartsOn } from "@/generated/prisma/enums.js";
import { requireRole } from "../authorize.middleware.js";

function mockUser(role: (typeof Role)[keyof typeof Role]) {
  return {
    id: "user-1",
    email: "a@b.com",
    name: "Test",
    role,
    isActive: true,
    units: Units.metric,
    weekStartsOn: WeekStartsOn.monday,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("requireRole", () => {
  it("calls next with AuthenticationError when req.user is missing", () => {
    const req = {} as Request;
    const next = vi.fn();

    requireRole(Role.admin)(req, {} as Response, next as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0]?.[0] as unknown;
    expect(err).toBeInstanceOf(AuthenticationError);
    if (err instanceof AuthenticationError) {
      expect(err.code).toBe(ERROR_CODES.UNAUTHENTICATED);
    }
  });

  it("calls next with AuthorizationError when role is not allowed", () => {
    const req = { user: mockUser(Role.user) } as Request;
    const next = vi.fn();

    requireRole(Role.admin)(req, {} as Response, next as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0]?.[0] as unknown;
    expect(err).toBeInstanceOf(AuthorizationError);
    if (err instanceof AuthorizationError) {
      expect(err.code).toBe(ERROR_CODES.INSUFFICIENT_PERMISSIONS);
    }
  });

  it("calls next with no error when role matches", () => {
    const req = { user: mockUser(Role.admin) } as Request;
    const next = vi.fn();

    requireRole(Role.admin)(req, {} as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith();
  });

  it("allows one of several roles", () => {
    const req = { user: mockUser(Role.user) } as Request;
    const next = vi.fn();

    requireRole(Role.admin, Role.user)(
      req,
      {} as Response,
      next as NextFunction,
    );

    expect(next).toHaveBeenCalledWith();
  });
});
