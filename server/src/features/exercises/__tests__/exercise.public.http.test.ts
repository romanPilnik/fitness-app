import { beforeAll, describe, expect, it } from "vitest";
import type { ApiError } from "@/types/api.types.js";
import { ERROR_CODES } from "@/types/error.types.js";
import { bearerAuth, registerTestUser } from "@/test/authHelpers.js";
import { testAgent } from "@/test/httpAgent.js";

describe("exercises GET — validation (authenticated)", () => {
  const agent = testAgent();
  let token: string;

  beforeAll(async () => {
    const r = await registerTestUser(agent);
    token = r.token;
  });

  it("returns 400 for invalid primaryMuscle enum", async () => {
    const res = await agent
      .get("/api/v1/exercises")
      .set(bearerAuth(token))
      .query({
        primaryMuscle: "invalid_muscle",
      });

    expect(res.status).toBe(400);
    const body = res.body as ApiError;
    expect(body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  it("returns 400 when limit exceeds max", async () => {
    const res = await agent
      .get("/api/v1/exercises")
      .set(bearerAuth(token))
      .query({ limit: 999 });

    expect(res.status).toBe(400);
    const body = res.body as ApiError;
    expect(body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  it("returns 400 when id is not a cuid", async () => {
    const res = await agent
      .get("/api/v1/exercises/not-a-cuid")
      .set(bearerAuth(token));

    expect(res.status).toBe(400);
    const body = res.body as ApiError;
    expect(body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });
});
