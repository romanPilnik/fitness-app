import type { NextFunction, Request, Response } from "express";
import * as z from "zod";
import { describe, expect, it, vi } from "vitest";
import { ValidationError } from "../../errors/index.js";
import { validate } from "../validate.middleware.js";

const bodySchema = z.object({
  body: z.object({ name: z.string().min(1) }),
});

describe("validate middleware", () => {
  it("calls next with ValidationError when parse fails", () => {
    const req = {
      body: {},
      query: {},
      params: {},
    } as unknown as Request;
    const next = vi.fn();

    validate(bodySchema)(req, {} as Response, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0]?.[0]).toBeInstanceOf(ValidationError);
  });

  it("assigns parsed body and calls next with no error", () => {
    const req = {
      body: { name: "Ada" },
      query: {},
      params: {},
    } as unknown as Request;
    const next = vi.fn();

    validate(bodySchema)(req, {} as Response, next as unknown as NextFunction);

    expect(req.body).toEqual({ name: "Ada" });
    expect(next).toHaveBeenCalledWith();
  });

  it("redefines read-only query (Express 5) with parsed query", () => {
    const querySchema = z.object({
      body: z.object({}).optional(),
      query: z.object({
        limit: z.coerce.number().int().default(20),
      }),
      params: z.object({}),
    });

    const req = { body: undefined, params: {} } as unknown as Request;
    Object.defineProperty(req, "query", {
      configurable: true,
      enumerable: true,
      get() {
        return { limit: "42" };
      },
    });

    const next = vi.fn();
    validate(querySchema)(req, {} as Response, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith();
    expect(req.query).toEqual({ limit: 42 });
  });
});
