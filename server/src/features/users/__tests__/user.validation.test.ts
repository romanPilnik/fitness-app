import { describe, expect, it } from "vitest";
import { Units } from "@/generated/prisma/enums.js";
import { changePassword, updateUser } from "../user.validation.js";

describe("updateUser", () => {
  it("accepts partial body with at least one field", () => {
    const r = updateUser.safeParse({
      body: { name: "  Pat  " },
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.body.name).toBe("Pat");
  });

  it("accepts units enum", () => {
    const r = updateUser.safeParse({
      body: { units: Units.metric },
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty object (refine)", () => {
    const r = updateUser.safeParse({ body: {} });
    expect(r.success).toBe(false);
  });
});

describe("changePassword", () => {
  it("accepts valid passwords", () => {
    const r = changePassword.safeParse({
      body: { oldPassword: "oldold12", newPassword: "newnew12" },
    });
    expect(r.success).toBe(true);
  });

  it("rejects new password without letters and numbers", () => {
    const r = changePassword.safeParse({
      body: { oldPassword: "oldold12", newPassword: "abcdefgh" },
    });
    expect(r.success).toBe(false);
  });
});
