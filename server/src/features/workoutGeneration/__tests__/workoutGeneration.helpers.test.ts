import { describe, expect, it } from "vitest";
import { GeneratedWorkoutStatus } from "@/generated/prisma/enums.js";
import {
  buildGeneratedWorkoutCreateArgs,
  orderAiExercisesLikeProgram,
} from "../workoutGeneration.helpers.js";
import type { AiWorkoutGenerationOutput } from "../workoutGeneration.validation.js";

describe("orderAiExercisesLikeProgram", () => {
  it("reorders AI exercises to match program order", () => {
    const output: AiWorkoutGenerationOutput = {
      exercises: [
        {
          exerciseId: "b",
          targetSets: 2,
          targetRir: 1,
          notes: null,
          sets: [{ setNumber: 1, targetWeight: 40, targetReps: 8, targetRir: 1 }],
        },
        {
          exerciseId: "a",
          targetSets: 3,
          targetRir: 2,
          notes: null,
          sets: [{ setNumber: 1, targetWeight: 60, targetReps: 5, targetRir: 2 }],
        },
      ],
    };
    const ordered = orderAiExercisesLikeProgram(["a", "b"], output);
    expect(ordered.map((e) => e.exerciseId)).toEqual(["a", "b"]);
  });

  it("throws when an exercise id is missing", () => {
    const output: AiWorkoutGenerationOutput = {
      exercises: [
        {
          exerciseId: "a",
          targetSets: 1,
          targetRir: null,
          notes: null,
          sets: [{ setNumber: 1, targetWeight: 1, targetReps: 1, targetRir: null }],
        },
      ],
    };
    expect(() => orderAiExercisesLikeProgram(["a", "b"], output)).toThrow(/Missing exercise/);
  });
});

describe("buildGeneratedWorkoutCreateArgs", () => {
  it("builds Prisma create input with program order", () => {
    const orderByExerciseId = new Map([
      ["ex-1", 1],
      ["ex-2", 2],
    ]);
    const input = buildGeneratedWorkoutCreateArgs({
      userId: "u-1",
      programId: "p-1",
      programWorkoutId: "pw-1",
      triggerSessionId: "s-1",
      aiProvider: "openai",
      aiModel: "gpt-4o-mini",
      status: GeneratedWorkoutStatus.completed,
      exercisesOrdered: [
        {
          exerciseId: "ex-1",
          targetSets: 2,
          targetRir: 1,
          notes: "x",
          sets: [
            { setNumber: 1, targetWeight: 50, targetReps: 8, targetRir: 1 },
            { setNumber: 2, targetWeight: 50, targetReps: 8, targetRir: 1 },
          ],
        },
        {
          exerciseId: "ex-2",
          targetSets: 1,
          targetRir: null,
          notes: null,
          sets: [{ setNumber: 1, targetWeight: 20, targetReps: 12, targetRir: null }],
        },
      ],
      orderByExerciseId,
    });
    const creates = (input.exercises as { create: { order: number }[] }).create;
    expect(creates[0]?.order).toBe(1);
    expect(creates[1]?.order).toBe(2);
  });
});
