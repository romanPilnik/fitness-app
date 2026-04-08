import { rateLimit } from "express-rate-limit";

const isDevelopment =
  (process.env.NODE_ENV ?? "development") === "development";

/** Used by `authLimiter` and unit-tested (Vitest sets `VITEST`). */
export function skipAuthRateLimitInVitest(): boolean {
  return process.env.VITEST === "true";
}

/** Stricter in production; relaxed locally while iterating on auth flows. */
const authMaxPerWindow = isDevelopment ? 1000 : 10;

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: authMaxPerWindow,
  message: "Too many login attempts, please try again later.",
  standardHeaders: "draft-8",
  skip: skipAuthRateLimitInVitest,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
  standardHeaders: "draft-8",
});
