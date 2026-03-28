import { rateLimit } from "express-rate-limit";

/** Used by `authLimiter` and unit-tested (Vitest sets `VITEST`). */
export function skipAuthRateLimitInVitest(): boolean {
  return process.env.VITEST === "true";
}

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
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
