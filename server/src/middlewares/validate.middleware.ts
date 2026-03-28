import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ValidationError } from "../errors/index";

export const validate =
  (schema: z.ZodType) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body as unknown,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      next(new ValidationError("Validation failed", result.error.issues));
      return;
    }

    const { body, query, params } = result.data as {
      body?: unknown;
      query?: typeof req.query;
      params?: typeof req.params;
    };
    if (body !== undefined) req.body = body;
    if (query !== undefined) {
      Object.defineProperty(req, "query", {
        enumerable: true,
        value: query,
        writable: true,
        configurable: true,
      });
    }
    if (params !== undefined) {
      Object.defineProperty(req, "params", {
        enumerable: true,
        value: params,
        writable: true,
        configurable: true,
      });
    }

    next();
  };
