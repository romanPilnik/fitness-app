import { afterEach, describe, expect, it, vi } from "vitest";
import {
  apiLimiter,
  authLimiter,
  skipAuthRateLimitInVitest,
} from "../rateLimit.middleware.js";

describe("skipAuthRateLimitInVitest", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns true when VITEST is the string true", () => {
    vi.stubEnv("VITEST", "true");
    expect(skipAuthRateLimitInVitest()).toBe(true);
  });

  it("returns false when VITEST is unset or not true", () => {
    vi.stubEnv("VITEST", "");
    expect(skipAuthRateLimitInVitest()).toBe(false);
  });
});

describe("rate limiters", () => {
  it("exports auth and api limiter instances", () => {
    expect(authLimiter).toBeDefined();
    expect(typeof authLimiter).toBe("function");
    expect(apiLimiter).toBeDefined();
    expect(typeof apiLimiter).toBe("function");
  });
});
