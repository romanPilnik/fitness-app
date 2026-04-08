import { beforeAll, describe, expect, it } from "vitest";
import type { ApiError } from "@/types/api.types.js";
import { ERROR_CODES } from "@/types/error.types.js";
import { bearerAuth, registerTestUser } from "@/test/authHelpers.js";
import { testAgent } from "@/test/httpAgent.js";

describe("templates GET list — validation (authenticated)", () => {
  const agent = testAgent();
  let token: string;

  beforeAll(async () => {
    const r = await registerTestUser(agent);
    token = r.token;
  });

  it("returns 400 for invalid difficulty enum", async () => {
    const res = await agent
      .get("/api/v1/programs/templates")
      .set(bearerAuth(token))
      .query({ difficulty: "not-an-enum" });

    expect(res.status).toBe(400);
    const body = res.body as ApiError;
    expect(body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  it("returns 400 when limit exceeds max", async () => {
    const res = await agent
      .get("/api/v1/programs/templates")
      .set(bearerAuth(token))
      .query({ limit: 200 });

    expect(res.status).toBe(400);
    const body = res.body as ApiError;
    expect(body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  it("returns 400 when daysPerWeek is out of range", async () => {
    const res = await agent
      .get("/api/v1/programs/templates")
      .set(bearerAuth(token))
      .query({ daysPerWeek: 99 });

    expect(res.status).toBe(400);
    const body = res.body as ApiError;
    expect(body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });
});
