import { describe, expect, it } from "vitest";
import {
  Equipment,
  ExerciseCategory,
  MovementPattern,
  MuscleGroup,
} from "@/generated/prisma/enums.js";
import {
  createExerciseSchema,
  deleteExerciseSchema,
  getExerciseByIdSchema,
  getExercisesSchema,
  updateExerciseSchema,
} from "../exercise.validation.js";

const validCuid = "clxy1234500000abcdef12345";

describe("getExercisesSchema", () => {
  it("accepts empty query with defaults", () => {
    const r = getExercisesSchema.safeParse({ query: {} });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.query.limit).toBe(20);
  });

  it("accepts filters and cursor", () => {
    const r = getExercisesSchema.safeParse({
      query: {
        primaryMuscle: MuscleGroup.chest,
        equipment: Equipment.barbell,
        limit: "10",
        cursor: validCuid,
      },
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid primaryMuscle", () => {
    const r = getExercisesSchema.safeParse({
      query: { primaryMuscle: "toes" },
    });
    expect(r.success).toBe(false);
  });
});

describe("getExerciseByIdSchema", () => {
  it("accepts cuid param", () => {
    const r = getExerciseByIdSchema.safeParse({
      params: { id: validCuid },
    });
    expect(r.success).toBe(true);
  });

  it("rejects non-cuid id", () => {
    const r = getExerciseByIdSchema.safeParse({
      params: { id: "not-a-cuid" },
    });
    expect(r.success).toBe(false);
  });
});

const minimalCreateBody = {
  name: "Bench",
  equipment: Equipment.barbell,
  primaryMuscle: MuscleGroup.chest,
  category: ExerciseCategory.compound,
  movementPattern: MovementPattern.horizontal_push,
};

describe("createExerciseSchema", () => {
  it("accepts minimal valid body", () => {
    const r = createExerciseSchema.safeParse({ body: minimalCreateBody });
    expect(r.success).toBe(true);
  });

  it("rejects name too long", () => {
    const r = createExerciseSchema.safeParse({
      body: { ...minimalCreateBody, name: "x".repeat(51) },
    });
    expect(r.success).toBe(false);
  });
});

describe("updateExerciseSchema", () => {
  it("accepts partial body with cuid param", () => {
    const r = updateExerciseSchema.safeParse({
      params: { id: validCuid },
      body: { name: "Press" },
    });
    expect(r.success).toBe(true);
  });

  it("rejects bad param id", () => {
    const r = updateExerciseSchema.safeParse({
      params: { id: "bad" },
      body: { name: "Press" },
    });
    expect(r.success).toBe(false);
  });
});

describe("deleteExerciseSchema", () => {
  it("accepts cuid", () => {
    const r = deleteExerciseSchema.safeParse({ params: { id: validCuid } });
    expect(r.success).toBe(true);
  });

  it("rejects invalid cuid", () => {
    const r = deleteExerciseSchema.safeParse({ params: { id: "x" } });
    expect(r.success).toBe(false);
  });
});
