import { describe, expect, it } from "vitest";
import type { ApiSuccess } from "@/types/api.types.js";
import { DEFAULT_AI_PREFERENCES } from "@/validations/aiUserPreferences.js";
import { testAgent } from "@/test/httpAgent.js";
import { registerTestUser, sessionAuth } from "@/test/authHelpers.js";

describe("users integration", () => {
  const agent = testAgent();

  it("GET /api/v1/users/me returns 200 with profile when authenticated", async () => {
    const { cookieHeader, user, email, name } = await registerTestUser(agent);

    const res = await agent
      .get("/api/v1/users/me")
      .set(sessionAuth(cookieHeader))
      .expect(200);

    const body = res.body as ApiSuccess<{
      id: string;
      email: string;
      name: string;
    }>;
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(user.id);
    expect(body.data.email).toBe(email);
    expect(body.data.name).toBe(name);
  });

  it("GET /api/v1/users/me/ai-preferences returns normalized defaults when unset", async () => {
    const { cookieHeader } = await registerTestUser(agent);

    const res = await agent
      .get("/api/v1/users/me/ai-preferences")
      .set(sessionAuth(cookieHeader))
      .expect(200);

    const body = res.body as ApiSuccess<typeof DEFAULT_AI_PREFERENCES>;
    expect(body.success).toBe(true);
    expect(body.data).toEqual(DEFAULT_AI_PREFERENCES);
  });

  it("PATCH /api/v1/users/me/ai-preferences merges partial update", async () => {
    const { cookieHeader } = await registerTestUser(agent);

    const patchRes = await agent
      .patch("/api/v1/users/me/ai-preferences")
      .set(sessionAuth(cookieHeader))
      .send({ progressionStyle: "aggressive", rirFloor: 3 })
      .expect(200);

    const patched = patchRes.body as ApiSuccess<typeof DEFAULT_AI_PREFERENCES>;
    expect(patched.success).toBe(true);
    expect(patched.data.progressionStyle).toBe("aggressive");
    expect(patched.data.rirFloor).toBe(3);

    const getRes = await agent
      .get("/api/v1/users/me/ai-preferences")
      .set(sessionAuth(cookieHeader))
      .expect(200);

    const got = getRes.body as ApiSuccess<typeof DEFAULT_AI_PREFERENCES>;
    expect(got.data).toEqual(patched.data);
  });
});
