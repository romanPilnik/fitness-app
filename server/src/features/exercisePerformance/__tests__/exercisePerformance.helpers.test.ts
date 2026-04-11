import { describe, expect, it } from "vitest";
import {
  countCompletedSets,
  pickTopSetWeightReps,
  pickTopSetWeightRepsFromCompleted,
} from "../exercisePerformance.helpers.js";

describe("pickTopSetWeightReps", () => {
  it("returns null for empty sets", () => {
    expect(pickTopSetWeightReps([])).toBeNull();
  });

  it("returns the only set when there is one", () => {
    expect(pickTopSetWeightReps([{ weight: 100, reps: 5 }])).toEqual({
      weight: 100,
      reps: 5,
    });
  });

  it("prefers higher weight", () => {
    expect(
      pickTopSetWeightReps([
        { weight: 80, reps: 10 },
        { weight: 100, reps: 3 },
        { weight: 90, reps: 8 },
      ]),
    ).toEqual({ weight: 100, reps: 3 });
  });

  it("on equal weight prefers higher reps", () => {
    expect(
      pickTopSetWeightReps([
        { weight: 100, reps: 5 },
        { weight: 100, reps: 8 },
      ]),
    ).toEqual({ weight: 100, reps: 8 });
  });

  it("keeps first occurrence when weight and reps tie", () => {
    expect(
      pickTopSetWeightReps([
        { weight: 100, reps: 5 },
        { weight: 100, reps: 5 },
      ]),
    ).toEqual({ weight: 100, reps: 5 });
  });
});

describe("pickTopSetWeightRepsFromCompleted", () => {
  it("ignores incomplete sets when picking top set", () => {
    expect(
      pickTopSetWeightRepsFromCompleted([
        { weight: 100, reps: 5, setCompleted: true },
        { weight: 120, reps: 3, setCompleted: false },
      ]),
    ).toEqual({ weight: 100, reps: 5 });
  });

  it("returns null when no completed sets", () => {
    expect(
      pickTopSetWeightRepsFromCompleted([
        { weight: 80, reps: 5, setCompleted: false },
      ]),
    ).toBeNull();
  });
});

describe("countCompletedSets", () => {
  it("counts only completed", () => {
    expect(
      countCompletedSets([
        { setCompleted: true },
        { setCompleted: false },
        { setCompleted: true },
      ]),
    ).toBe(2);
  });
});
