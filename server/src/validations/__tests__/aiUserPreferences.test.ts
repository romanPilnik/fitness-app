import { describe, expect, it } from "vitest";
import {
  DEFAULT_AI_PREFERENCES,
  mergeAiUserPreferencesPatch,
  normalizeAiUserPreferences,
} from "../aiUserPreferences.js";

describe("normalizeAiUserPreferences", () => {
  it("returns defaults for null/undefined", () => {
    expect(normalizeAiUserPreferences(null)).toEqual(DEFAULT_AI_PREFERENCES);
    expect(normalizeAiUserPreferences(undefined)).toEqual(DEFAULT_AI_PREFERENCES);
  });

  it("returns defaults for non-object input", () => {
    expect(normalizeAiUserPreferences("x")).toEqual(DEFAULT_AI_PREFERENCES);
    expect(normalizeAiUserPreferences([])).toEqual(DEFAULT_AI_PREFERENCES);
  });

  it("fills missing keys from defaults", () => {
    expect(normalizeAiUserPreferences({ progressionStyle: "aggressive" })).toEqual({
      ...DEFAULT_AI_PREFERENCES,
      progressionStyle: "aggressive",
    });
  });

  it("falls back to defaults when merged object is invalid", () => {
    expect(normalizeAiUserPreferences({ rirFloor: 99 })).toEqual(DEFAULT_AI_PREFERENCES);
  });
});

describe("mergeAiUserPreferencesPatch", () => {
  it("applies partial patch over current", () => {
    const next = mergeAiUserPreferencesPatch(DEFAULT_AI_PREFERENCES, {
      progressionStyle: "conservative",
    });
    expect(next).toEqual({ ...DEFAULT_AI_PREFERENCES, progressionStyle: "conservative" });
  });
});
