import { describe, expect, it } from "vitest";
import type { ApiError } from "@/types/api.types.js";
import { ERROR_CODES } from "@/types/error.types.js";
import { testAgent } from "@/test/httpAgent.js";

/** `/users/me` uses Better Auth `verifySession` (session cookie), not Bearer tokens. */
describe("verifySession — GET /api/v1/users/me unauthenticated", () => {
  const agent = testAgent();

  it("returns 401 when Cookie header is missing", async () => {
    const res = await agent.get("/api/v1/users/me");

    expect(res.status).toBe(401);
    const body = res.body as ApiError;
    expect(body.success).toBe(false);
    expect(body.error.code).toBe(ERROR_CODES.UNAUTHENTICATED);
  });

  it("returns 401 UNAUTHENTICATED when Authorization Bearer is present without a valid session", async () => {
    const res = await agent
      .get("/api/v1/users/me")
      .set("Authorization", "Bearer not-a-session");

    expect(res.status).toBe(401);
    const body = res.body as ApiError;
    expect(body.error.code).toBe(ERROR_CODES.UNAUTHENTICATED);
  });
});
