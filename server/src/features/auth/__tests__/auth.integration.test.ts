import { describe, expect, it } from "vitest";
import type { ApiSuccess } from "@/types/api.types.js";
import { testAgent } from "@/test/httpAgent.js";
import { registerTestUser, loginTestUser } from "@/test/authHelpers.js";

describe("auth integration", () => {
  const agent = testAgent();

  it("register returns 201 with token and user", async () => {
    const { token, user, email } = await registerTestUser(agent);

    expect(token).toBeTruthy();
    expect(user.email).toBe(email);
    expect(user.id).toBeTruthy();
    expect(user.name).toBeTruthy();
  });

  it("login returns 200 for registered user", async () => {
    const { email, password } = await registerTestUser(agent);
    const { token, user } = await loginTestUser(agent, email, password);

    expect(token).toBeTruthy();
    expect(user.email).toBe(email);
  });

  it("login returns 200 via raw HTTP envelope", async () => {
    const { email, password, name } = await registerTestUser(agent);
    const res = await agent
      .post("/api/v1/auth/login")
      .send({ email, password })
      .expect(200);

    const body = res.body as ApiSuccess<{
      token: string;
      user: { id: string; email: string; name: string };
    }>;
    expect(body.success).toBe(true);
    expect(body.data.token).toBeTruthy();
    expect(body.data.user.email).toBe(email);
    expect(body.data.user.name).toBe(name);
  });
});
