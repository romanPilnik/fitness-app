import { describe, expect, it } from "vitest";
import {
  loginSchema,
  passwordRegex,
  registerSchema,
} from "../auth.validation.js";

describe("passwordRegex", () => {
  it("requires at least one letter and one digit", () => {
    expect(passwordRegex.test("a1")).toBe(true);
    expect(passwordRegex.test("1a")).toBe(true);
    expect(passwordRegex.test("ab12")).toBe(true);
  });

  it("rejects letters only or digits only", () => {
    expect(passwordRegex.test("abc")).toBe(false);
    expect(passwordRegex.test("123")).toBe(false);
  });

  it("rejects empty or whitespace-only", () => {
    expect(passwordRegex.test("")).toBe(false);
    expect(passwordRegex.test("   ")).toBe(false);
  });
});

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
