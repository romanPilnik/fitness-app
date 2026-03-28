import type { NextFunction, Request, Response } from "express";
import * as z from "zod";
import { describe, expect, it, vi } from "vitest";
import { ValidationError } from "../errors/index.js";
import { validate } from "./validate.middleware.js";

const schema = z.object({
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

    validate(schema)(req, {} as Response, next as unknown as NextFunction);

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

    validate(schema)(req, {} as Response, next as unknown as NextFunction);

    expect(req.body).toEqual({ name: "Ada" });
    expect(next).toHaveBeenCalledWith();
  });
});
