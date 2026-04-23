import { describe, expect, it } from "vitest";
import type { ApiError, ApiSuccess } from "@/types/api.types.js";
import { ERROR_CODES } from "@/types/error.types.js";
import { registerTestUser, sessionAuth } from "@/test/authHelpers.js";
import { testAgent } from "@/test/httpAgent.js";

interface ExerciseListPayload {
  data: unknown[];
  nextCursor: string | null;
  hasMore: boolean;
}

describe("exercises integration", () => {
  const agent = testAgent();

  it("GET /api/v1/exercises returns 200 with empty page after truncate", async () => {
    const { cookieHeader } = await registerTestUser(agent);
    const res = await agent
      .get("/api/v1/exercises")
      .set(sessionAuth(cookieHeader))
      .expect(200);

    const body = res.body as ApiSuccess<ExerciseListPayload>;
    expect(body.success).toBe(true);
    expect(body.data.data).toEqual([]);
    expect(body.data.nextCursor).toBeNull();
    expect(body.data.hasMore).toBe(false);
  });

  it("POST /api/v1/exercises returns 403 when user is not admin", async () => {
    const { cookieHeader } = await registerTestUser(agent);

    const res = await agent
      .post("/api/v1/exercises")
      .set(sessionAuth(cookieHeader))
      .send({
        name: "User Bench",
        equipment: "barbell",
        primaryMuscle: "chest",
        secondaryMuscles: [],
        category: "compound",
        movementPattern: "horizontal_push",
      });

    expect(res.status).toBe(403);
    const body = res.body as ApiError;
    expect(body.error.code).toBe(ERROR_CODES.INSUFFICIENT_PERMISSIONS);
  });
});
