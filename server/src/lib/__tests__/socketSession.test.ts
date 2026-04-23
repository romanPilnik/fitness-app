import { beforeEach, describe, expect, it, vi } from "vitest";

const getSession = vi.hoisted(() => vi.fn());

vi.mock("../auth.js", () => ({
  auth: {
    api: {
      getSession,
    },
  },
}));

import { getRequestUserFromHandshakeHeaders } from "../socketSession.js";

describe("getRequestUserFromHandshakeHeaders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when Better Auth has no session", async () => {
    getSession.mockResolvedValue(null);

    const user = await getRequestUserFromHandshakeHeaders({
      cookie: "better-auth.session_token=invalid",
    });

    expect(user).toBeNull();
  });

  it("returns null when user is inactive", async () => {
    getSession.mockResolvedValue({
      user: {
        id: "u1",
        email: "a@b.com",
        name: "Test",
        role: "user",
        isActive: false,
        units: "metric",
        weekStartsOn: "sunday",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const user = await getRequestUserFromHandshakeHeaders({});

    expect(user).toBeNull();
  });

  it("maps an active session to RequestUser", async () => {
    const createdAt = new Date("2024-01-01T00:00:00.000Z");
    const updatedAt = new Date("2024-06-01T00:00:00.000Z");

    getSession.mockResolvedValue({
      user: {
        id: "u1",
        email: "a@b.com",
        name: "Test",
        role: "user",
        isActive: true,
        units: "metric",
        weekStartsOn: "sunday",
        createdAt,
        updatedAt,
      },
    });

    const user = await getRequestUserFromHandshakeHeaders({
      cookie: "better-auth.session_token=abc",
    });

    expect(user).toEqual({
      id: "u1",
      email: "a@b.com",
      name: "Test",
      role: "user",
      isActive: true,
      units: "metric",
      weekStartsOn: "sunday",
      createdAt,
      updatedAt,
    });
  });
});
