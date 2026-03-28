import { describe, expect, it } from "vitest";
import type { ApiError } from "@/types/api.types.js";
import { ERROR_CODES } from "@/types/error.types.js";
import { testAgent } from "@/test/httpAgent.js";

describe("exercises public GET — validation only", () => {
  const agent = testAgent();

  it("returns 400 for invalid primaryMuscle enum", async () => {
    const res = await agent.get("/api/v1/exercises").query({
      primaryMuscle: "invalid_muscle",
    });

    expect(res.status).toBe(400);
    const body = res.body as ApiError;
    expect(body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  it("returns 400 when limit exceeds max", async () => {
    const res = await agent.get("/api/v1/exercises").query({ limit: 999 });

    expect(res.status).toBe(400);
    const body = res.body as ApiError;
    expect(body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });

  it("returns 400 when id is not a cuid", async () => {
    const res = await agent.get("/api/v1/exercises/not-a-cuid");

    expect(res.status).toBe(400);
    const body = res.body as ApiError;
    expect(body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
  });
});
