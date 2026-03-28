import jwt from "jsonwebtoken";
import { describe, expect, it } from "vitest";
import type { ApiError } from "@/types/api.types.js";
import { ERROR_CODES } from "@/types/error.types.js";
import { testAgent } from "@/test/httpAgent.js";

describe("verifyToken — failures before DB", () => {
  const agent = testAgent();

  it("returns 401 when Authorization header is missing", async () => {
    const res = await agent.get("/api/v1/users/me");

    expect(res.status).toBe(401);
    const body = res.body as ApiError;
    expect(body.success).toBe(false);
    expect(body.error.code).toBe(ERROR_CODES.TOKEN_REQUIRED);
  });

  it("returns 401 when Bearer token is not a valid JWT", async () => {
    const res = await agent
      .get("/api/v1/users/me")
      .set("Authorization", "Bearer not-a-jwt");

    expect(res.status).toBe(401);
    const body = res.body as ApiError;
    expect(body.error.code).toBe(ERROR_CODES.INVALID_TOKEN);
  });

  it("returns 401 when Bearer token has invalid signature", async () => {
    const res = await agent
      .get("/api/v1/users/me")
      .set(
        "Authorization",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbHVnLWZha2UifQ.wrong-signature-part",
      );

    expect(res.status).toBe(401);
    const body = res.body as ApiError;
    expect(body.error.code).toBe(ERROR_CODES.INVALID_TOKEN);
  });

  it("returns 401 TOKEN_EXPIRED when JWT is expired (no DB lookup)", async () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET must be set for auth HTTP tests");
    }

    const token = jwt.sign({ userId: "clxxxxxxxxxxxxxxxxxxxxxxxx" }, secret, {
      expiresIn: "-1s",
      algorithm: "HS256",
    });

    const res = await agent
      .get("/api/v1/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
    const body = res.body as ApiError;
    expect(body.error.code).toBe(ERROR_CODES.TOKEN_EXPIRED);
  });
});
