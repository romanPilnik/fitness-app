import { expect } from "vitest";
import request from "supertest";
import generateAuthToken from "@/features/auth/auth.helpers.js";
import type { ApiSuccess } from "@/types/api.types.js";

export type HttpTestAgent = ReturnType<typeof request>;

export interface AuthUserPayload {
  id: string;
  email: string;
  name: string;
}

interface AuthResponseData {
  token: string;
  user: AuthUserPayload;
}

/** `Authorization` header for Bearer JWT (API uses Bearer, not cookies). */
export function bearerAuth(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

/**
 * Mint a valid JWT for an existing `userId`. `verifyToken` still loads the user
 * from the DB — use after register/seed, or use `registerTestUser` / `loginTestUser`.
 */
export function mintBearerAuth(userId: string): { Authorization: string } {
  return bearerAuth(generateAuthToken(userId));
}

interface RegisterResult extends AuthResponseData {
  email: string;
  password: string;
  name: string;
}

/** Register via HTTP; default credentials are unique per call. */
export async function registerTestUser(
  agent: HttpTestAgent,
  overrides?: Partial<Pick<RegisterResult, "email" | "password" | "name">>,
): Promise<RegisterResult> {
  const email =
    overrides?.email ??
    `test-${String(Date.now())}-${Math.random().toString(36).slice(2, 11)}@example.com`;
  const password = overrides?.password ?? "testpass1A";
  const name = overrides?.name ?? "Test User";

  const res = await agent
    .post("/api/v1/auth/register")
    .send({ email, password, name })
    .expect(201);

  const body = res.body as ApiSuccess<AuthResponseData>;
  expect(body.success).toBe(true);

  return {
    token: body.data.token,
    user: body.data.user,
    email,
    password,
    name,
  };
}

/** Log in via HTTP. */
export async function loginTestUser(
  agent: HttpTestAgent,
  email: string,
  password: string,
): Promise<AuthResponseData> {
  const res = await agent
    .post("/api/v1/auth/login")
    .send({ email, password })
    .expect(200);

  const body = res.body as ApiSuccess<AuthResponseData>;
  expect(body.success).toBe(true);
  return body.data;
}
