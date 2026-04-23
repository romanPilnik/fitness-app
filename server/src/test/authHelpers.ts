import { expect } from "vitest";
import request from "supertest";

const AUTH_BASE = "/api/auth";
const DEFAULT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

export type HttpTestAgent = ReturnType<typeof request>;

export interface AuthUserPayload {
  id: string;
  email: string;
  name: string;
}

interface SessionResponse {
  token: string | null;
  user: AuthUserPayload;
}

export interface RegisterResult {
  email: string;
  password: string;
  name: string;
  user: AuthUserPayload;
  /** Value for the `Cookie` header on `/api/v1/*` requests (Better Auth session). */
  cookieHeader: string;
}

function cookieHeaderFromResponse(res: request.Response): string {
  const raw = res.headers["set-cookie"] as string | string[] | undefined;
  if (!raw) return "";
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr
    .map((c) => (typeof c === "string" ? c.split(";")[0] : ""))
    .filter(Boolean)
    .join("; ");
}

/** Headers for an authenticated request: session cookie + trusted `Origin` (Better Auth CSRF). */
export function sessionAuth(cookieHeader: string): { Cookie: string; Origin: string } {
  return { Cookie: cookieHeader, Origin: DEFAULT_ORIGIN };
}

export async function registerTestUser(
  agent: HttpTestAgent,
  overrides?: Partial<Pick<RegisterResult, "email" | "password" | "name">>,
): Promise<RegisterResult> {
  const email =
    overrides?.email ??
    `test-${String(Date.now())}-${Math.random().toString(36).slice(2, 11)}@example.com`;
  const password = overrides?.password ?? "testpass1A";
  const name = overrides?.name ?? "Test User";

  const res = await agent.post(`${AUTH_BASE}/sign-up/email`).send({ email, password, name }).expect(200);

  const body = res.body as SessionResponse;
  expect(body.user).toBeTruthy();

  const cookieHeader = cookieHeaderFromResponse(res);
  expect(cookieHeader.length).toBeGreaterThan(0);

  return {
    user: body.user,
    email,
    password,
    name,
    cookieHeader,
  };
}

export async function loginTestUser(
  agent: HttpTestAgent,
  email: string,
  password: string,
): Promise<SessionResponse & { cookieHeader: string }> {
  const res = await agent.post(`${AUTH_BASE}/sign-in/email`).send({ email, password }).expect(200);

  const body = res.body as SessionResponse;
  const cookieHeader = cookieHeaderFromResponse(res);
  expect(cookieHeader.length).toBeGreaterThan(0);

  return { ...body, cookieHeader };
}

/** @deprecated Use {@link sessionAuth} — tests historically used `bearerAuth(token)`. */
export function bearerAuth(cookieHeader: string): { Cookie: string; Origin: string } {
  return sessionAuth(cookieHeader);
}
