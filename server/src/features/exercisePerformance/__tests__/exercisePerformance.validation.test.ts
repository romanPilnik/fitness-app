import { describe, expect, it } from "vitest";
import { getExercisePerformanceSchema } from "../exercisePerformance.validation.js";

describe("getExercisePerformanceSchema", () => {
  it("accepts exerciseId param", () => {
    const r = getExercisePerformanceSchema.safeParse({
      params: { exerciseId: "ex-1" },
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing exerciseId", () => {
    const r = getExercisePerformanceSchema.safeParse({ params: {} });
    expect(r.success).toBe(false);
  });
});
