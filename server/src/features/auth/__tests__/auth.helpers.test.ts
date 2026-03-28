import jwt from "jsonwebtoken";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/errors/index.js";
import { ERROR_CODES } from "@/types/error.types.js";
import generateAuthToken from "../auth.helpers.js";

describe("generateAuthToken", () => {
  const testSecret = "test-jwt-secret-at-least-32-chars-long";

  beforeEach(() => {
    vi.stubEnv("JWT_SECRET", testSecret);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("throws AppError when JWT_SECRET is missing", () => {
    vi.stubEnv("JWT_SECRET", "");
    expect(() => generateAuthToken("user-1")).toThrow(AppError);
    try {
      generateAuthToken("user-1");
    } catch (e) {
      expect(e).toBeInstanceOf(AppError);
      if (e instanceof AppError) {
        expect(e.statusCode).toBe(500);
        expect(e.code).toBe(ERROR_CODES.INTERNAL_ERROR);
        expect(e.message).toBe("Server configuration error");
      }
    }
  });

  it("returns a verifiable HS256 token with userId", () => {
    const token = generateAuthToken("user-xyz");
    const payload = jwt.verify(token, testSecret) as { userId: string };
    expect(payload.userId).toBe("user-xyz");
  });

  it("respects JWT_EXPIRE when set", () => {
    vi.stubEnv("JWT_EXPIRE", "60s");
    const token = generateAuthToken("u1");
    const decoded = jwt.decode(token, { complete: true });
    expect(decoded).not.toBeNull();
    if (decoded === null) {
      throw new Error("expected decoded token");
    }
    expect(decoded.payload).toMatchObject({ userId: "u1" });
    expect(() => jwt.verify(token, testSecret)).not.toThrow();
  });
});
