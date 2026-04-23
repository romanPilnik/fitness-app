import { describe, expect, it } from "vitest";
import { Units } from "@/generated/prisma/enums.js";
import { updateUser } from "../user.validation.js";

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
