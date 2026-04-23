import { describe, expect, it } from "vitest";
import {
  validateAiOutputBusinessRules,
  type BusinessValidationContext,
} from "../workoutGeneration.businessValidation.js";
import type { AiWorkoutGenerationOutput } from "../workoutGeneration.validation.js";

function makeContext(overrides?: Partial<BusinessValidationContext>): BusinessValidationContext {
  return {
    programExerciseIds: ["ex1", "ex2"],
    previousWeightsByExercise: new Map(),
    ...overrides,
  };
}

function makeValidOutput(): AiWorkoutGenerationOutput {
  return {
    exercises: [
      {
        exerciseId: "ex1",
        targetSets: 3,
        targetRir: 2,
        notes: null,
        sets: [
          { setNumber: 1, targetWeight: 60, targetReps: 8, targetRir: 2 },
          { setNumber: 2, targetWeight: 60, targetReps: 8, targetRir: 2 },
          { setNumber: 3, targetWeight: 60, targetReps: 8, targetRir: 2 },
        ],
      },
      {
        exerciseId: "ex2",
        targetSets: 2,
        targetRir: 3,
        notes: null,
        sets: [
          { setNumber: 1, targetWeight: 20, targetReps: 12, targetRir: 3 },
          { setNumber: 2, targetWeight: 20, targetReps: 12, targetRir: 3 },
        ],
      },
    ],
  };
}

describe("validateAiOutputBusinessRules", () => {
  it("returns no errors for valid output", () => {
    const errors = validateAiOutputBusinessRules(makeValidOutput(), makeContext());
    expect(errors).toEqual([]);
  });

  it("detects missing exercise", () => {
    const output = makeValidOutput();
    const first = output.exercises[0];
    if (!first) {
      throw new Error("expected first exercise");
    }
    output.exercises = [first];
    const errors = validateAiOutputBusinessRules(output, makeContext());
    expect(errors.some((e) => e.rule === "EXERCISE_COUNT_MISMATCH")).toBe(true);
    expect(errors.some((e) => e.rule === "MISSING_EXERCISE")).toBe(true);
  });

  it("detects extra exercise", () => {
    const output = makeValidOutput();
    output.exercises.push({
      exerciseId: "ex3",
      targetSets: 1,
      targetRir: null,
      notes: null,
      sets: [{ setNumber: 1, targetWeight: 10, targetReps: 10, targetRir: null }],
    });
    const errors = validateAiOutputBusinessRules(output, makeContext());
    expect(errors.some((e) => e.rule === "EXERCISE_COUNT_MISMATCH")).toBe(true);
    expect(errors.some((e) => e.rule === "EXTRA_EXERCISE")).toBe(true);
  });

  it("detects targetSets/sets.length mismatch", () => {
    const output = makeValidOutput();
    const ex0 = output.exercises[0];
    if (ex0) {
      ex0.targetSets = 5;
    }
    const errors = validateAiOutputBusinessRules(output, makeContext());
    expect(errors.some((e) => e.rule === "TARGET_SETS_MISMATCH")).toBe(true);
  });

  it("detects non-sequential set numbers", () => {
    const output = makeValidOutput();
    const s = output.exercises[0]?.sets[1];
    if (s) {
      s.setNumber = 5;
    }
    const errors = validateAiOutputBusinessRules(output, makeContext());
    expect(errors.some((e) => e.rule === "SET_NUMBER_SEQUENCE")).toBe(true);
  });

  it("detects too many sets", () => {
    const output = makeValidOutput();
    const ex = output.exercises[0];
    if (ex) {
      ex.sets = Array.from({ length: 11 }, (_, i) => ({
        setNumber: i + 1,
        targetWeight: 60,
        targetReps: 8,
        targetRir: 2,
      }));
      ex.targetSets = 11;
    }
    const errors = validateAiOutputBusinessRules(output, makeContext());
    expect(errors.some((e) => e.rule === "TOO_MANY_SETS")).toBe(true);
  });

  it("detects weight too high", () => {
    const output = makeValidOutput();
    const s = output.exercises[0]?.sets[0];
    if (s) {
      s.targetWeight = 600;
    }
    const errors = validateAiOutputBusinessRules(output, makeContext());
    expect(errors.some((e) => e.rule === "WEIGHT_TOO_HIGH")).toBe(true);
  });

  it("detects reps too high", () => {
    const output = makeValidOutput();
    const s = output.exercises[0]?.sets[0];
    if (s) {
      s.targetReps = 150;
    }
    const errors = validateAiOutputBusinessRules(output, makeContext());
    expect(errors.some((e) => e.rule === "REPS_TOO_HIGH")).toBe(true);
  });

  it("detects weight jump too large", () => {
    const ctx = makeContext({
      previousWeightsByExercise: new Map([["ex1", 60]]),
    });
    const output = makeValidOutput();
    const s = output.exercises[0]?.sets[0];
    if (s) {
      s.targetWeight = 200;
    }
    const errors = validateAiOutputBusinessRules(output, ctx);
    expect(errors.some((e) => e.rule === "WEIGHT_JUMP_TOO_LARGE")).toBe(true);
  });

  it("detects weight drop too large", () => {
    const ctx = makeContext({
      previousWeightsByExercise: new Map([["ex1", 100]]),
    });
    const output = makeValidOutput();
    for (const s of output.exercises[0]?.sets ?? []) {
      s.targetWeight = 10;
    }
    const errors = validateAiOutputBusinessRules(output, ctx);
    expect(errors.some((e) => e.rule === "WEIGHT_DROP_TOO_LARGE")).toBe(true);
  });

  it("skips weight jump check when no previous weight", () => {
    const output = makeValidOutput();
    const s = output.exercises[0]?.sets[0];
    if (s) {
      s.targetWeight = 200;
    }
    const errors = validateAiOutputBusinessRules(output, makeContext());
    expect(errors.some((e) => e.rule === "WEIGHT_JUMP_TOO_LARGE")).toBe(false);
  });

  it("skips weight jump check when previous weight is 0", () => {
    const ctx = makeContext({
      previousWeightsByExercise: new Map([["ex1", 0]]),
    });
    const output = makeValidOutput();
    const s = output.exercises[0]?.sets[0];
    if (s) {
      s.targetWeight = 200;
    }
    const errors = validateAiOutputBusinessRules(output, ctx);
    expect(errors.some((e) => e.rule === "WEIGHT_JUMP_TOO_LARGE")).toBe(false);
  });
});
