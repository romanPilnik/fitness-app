import { describe, expect, it } from "vitest";
import type { ApiSuccess } from "@/types/api.types.js";
import { testAgent } from "@/test/httpAgent.js";
import { registerTestUser, bearerAuth } from "@/test/authHelpers.js";

describe("users integration", () => {
  const agent = testAgent();

  it("GET /api/v1/users/me returns 200 with profile when authenticated", async () => {
    const { token, user, email, name } = await registerTestUser(agent);

    const res = await agent
      .get("/api/v1/users/me")
      .set(bearerAuth(token))
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
});
