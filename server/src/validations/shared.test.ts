import { describe, expect, it } from "vitest";
import { passwordRegex } from "./shared.js";

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
