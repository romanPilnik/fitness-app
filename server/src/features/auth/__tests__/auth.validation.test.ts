import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "../auth.validation.js";

describe("loginSchema", () => {
  it("accepts valid body", () => {
    const r = loginSchema.safeParse({
      body: { email: "a@b.co", password: "secret" },
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const r = loginSchema.safeParse({
      body: { email: "not-email", password: "secret" },
    });
    expect(r.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts valid body", () => {
    const r = registerSchema.safeParse({
      body: {
        email: "user@example.com",
        password: "abcd1234",
        name: "Jane",
      },
    });
    expect(r.success).toBe(true);
  });

  it("rejects password without digit letter mix", () => {
    const r = registerSchema.safeParse({
      body: {
        email: "u@e.com",
        password: "abcdefgh",
        name: "Jane",
      },
    });
    expect(r.success).toBe(false);
  });

  it("rejects short name", () => {
    const r = registerSchema.safeParse({
      body: {
        email: "u@e.com",
        password: "abcd1234",
        name: "J",
      },
    });
    expect(r.success).toBe(false);
  });
});
