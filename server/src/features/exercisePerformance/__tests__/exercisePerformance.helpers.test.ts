import { describe, expect, it } from "vitest";
import { pickTopSetWeightReps } from "../exercisePerformance.helpers.js";

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
