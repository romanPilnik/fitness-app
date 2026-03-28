import { describe, expect, it } from "vitest";
import {
  getExerciseProfileById,
  getExerciseProfiles,
  updateExerciseProfile,
} from "./exerciseProfile.validation.js";

describe("getExerciseProfiles", () => {
  it("accepts empty query", () => {
    const r = getExerciseProfiles.safeParse({ query: {} });
    expect(r.success).toBe(true);
  });

  it("accepts coerced booleans", () => {
    const r = getExerciseProfiles.safeParse({
      query: { isFavorite: "true", needsFormCheck: "false" },
    });
    expect(r.success).toBe(true);
  });
});

describe("getExerciseProfileById", () => {
  it("accepts exerciseId param", () => {
    const r = getExerciseProfileById.safeParse({
      params: { exerciseId: "ex-1" },
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing exerciseId", () => {
    const r = getExerciseProfileById.safeParse({ params: {} });
    expect(r.success).toBe(false);
  });
});

describe("updateExerciseProfile", () => {
  it("accepts partial body", () => {
    const r = updateExerciseProfile.safeParse({
      params: { exerciseId: "ex-1" },
      body: { isFavorite: true },
    });
    expect(r.success).toBe(true);
  });

  it("rejects rating out of range", () => {
    const r = updateExerciseProfile.safeParse({
      params: { exerciseId: "ex-1" },
      body: { difficultyRating: 10 },
    });
    expect(r.success).toBe(false);
  });
});
