import { describe, expect, it } from "vitest";
import {
  Difficulty,
  Goal,
  ProgramSources,
  ProgramStatuses,
  SplitType,
} from "@/generated/prisma/enums.js";
import {
  addProgramWorkoutSchema,
  addWorkoutExerciseSchema,
  bulkReorderWorkoutExercisesSchema,
  createCustomProgramSchema,
  createFromTemplateSchema,
  deleteProgramSchema,
  deleteProgramWorkoutSchema,
  deleteWorkoutExerciseSchema,
  getProgramByIdSchema,
  getProgramsSchema,
  updateProgramSchema,
  updateProgramWorkoutSchema,
  updateWorkoutExerciseSchema,
} from "../program.validation.js";

const programWorkout = {
  name: "A",
  dayNumber: 1,
  exercises: [
    {
      exerciseId: "e1",
      order: 1,
      targetSets: 3,
    },
  ],
};

const customProgramBody = {
  name: "My program",
  difficulty: Difficulty.beginner,
  goal: Goal.hypertrophy,
  splitType: SplitType.push_pull_legs,
  daysPerWeek: 3,
  workouts: [programWorkout],
};

describe("getProgramsSchema", () => {
  it("accepts empty query and defaults sort", () => {
    const r = getProgramsSchema.safeParse({ query: {} });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.query.sort).toBe("created_desc");
    }
  });

  it("accepts filters", () => {
    const r = getProgramsSchema.safeParse({
      query: {
        status: ProgramStatuses.active,
        createdFrom: ProgramSources.template,
      },
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.query.sort).toBe("created_desc");
    }
  });

  it("accepts sort name_asc", () => {
    const r = getProgramsSchema.safeParse({ query: { sort: "name_asc" } });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.query.sort).toBe("name_asc");
    }
  });

  it("rejects invalid sort", () => {
    const r = getProgramsSchema.safeParse({ query: { sort: "bogus" } });
    expect(r.success).toBe(false);
  });

  it("rejects invalid status enum", () => {
    const r = getProgramsSchema.safeParse({
      query: { status: "archived" },
    });
    expect(r.success).toBe(false);
  });
});

describe("getProgramByIdSchema", () => {
  it("accepts id", () => {
    const r = getProgramByIdSchema.safeParse({ params: { id: "p1" } });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    const r = getProgramByIdSchema.safeParse({ params: {} });
    expect(r.success).toBe(false);
  });
});

describe("createFromTemplateSchema", () => {
  it("accepts templateId", () => {
    const r = createFromTemplateSchema.safeParse({
      body: { templateId: "t1" },
    });
    expect(r.success).toBe(true);
  });

  it("accepts optional iso startDate", () => {
    const r = createFromTemplateSchema.safeParse({
      body: {
        templateId: "t1",
        startDate: "2026-01-15T12:00:00.000Z",
      },
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid datetime", () => {
    const r = createFromTemplateSchema.safeParse({
      body: { templateId: "t1", startDate: "not iso" },
    });
    expect(r.success).toBe(false);
  });
});

describe("createCustomProgramSchema", () => {
  it("accepts valid body", () => {
    const r = createCustomProgramSchema.safeParse({
      body: customProgramBody,
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty workouts", () => {
    const r = createCustomProgramSchema.safeParse({
      body: { ...customProgramBody, workouts: [] },
    });
    expect(r.success).toBe(false);
  });
});

describe("updateProgramSchema", () => {
  it("accepts partial body", () => {
    const r = updateProgramSchema.safeParse({
      params: { id: "p1" },
      body: { name: "New" },
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty body", () => {
    const r = updateProgramSchema.safeParse({
      params: { id: "p1" },
      body: {},
    });
    expect(r.success).toBe(false);
  });
});

describe("deleteProgramSchema", () => {
  it("accepts id", () => {
    const r = deleteProgramSchema.safeParse({ params: { id: "p1" } });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    const r = deleteProgramSchema.safeParse({ params: {} });
    expect(r.success).toBe(false);
  });
});

describe("addProgramWorkoutSchema", () => {
  it("accepts body", () => {
    const r = addProgramWorkoutSchema.safeParse({
      params: { id: "p1" },
      body: { name: "Day 2", dayNumber: 2 },
    });
    expect(r.success).toBe(true);
  });

  it("rejects dayNumber > 14", () => {
    const r = addProgramWorkoutSchema.safeParse({
      params: { id: "p1" },
      body: { name: "Day", dayNumber: 15 },
    });
    expect(r.success).toBe(false);
  });
});

describe("updateProgramWorkoutSchema", () => {
  it("accepts partial body", () => {
    const r = updateProgramWorkoutSchema.safeParse({
      params: { id: "p1", workoutId: "w1" },
      body: { name: "Renamed" },
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty body", () => {
    const r = updateProgramWorkoutSchema.safeParse({
      params: { id: "p1", workoutId: "w1" },
      body: {},
    });
    expect(r.success).toBe(false);
  });
});

describe("deleteProgramWorkoutSchema", () => {
  it("accepts params", () => {
    const r = deleteProgramWorkoutSchema.safeParse({
      params: { id: "p1", workoutId: "w1" },
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing workoutId", () => {
    const r = deleteProgramWorkoutSchema.safeParse({
      params: { id: "p1" },
    });
    expect(r.success).toBe(false);
  });
});

describe("addWorkoutExerciseSchema", () => {
  it("accepts exercise payload", () => {
    const r = addWorkoutExerciseSchema.safeParse({
      params: { id: "p1", workoutId: "w1" },
      body: { exerciseId: "e1", order: 1, targetSets: 2 },
    });
    expect(r.success).toBe(true);
  });

  it("rejects order below 1", () => {
    const r = addWorkoutExerciseSchema.safeParse({
      params: { id: "p1", workoutId: "w1" },
      body: { exerciseId: "e1", order: 0, targetSets: 2 },
    });
    expect(r.success).toBe(false);
  });
});

describe("updateWorkoutExerciseSchema", () => {
  it("accepts partial body", () => {
    const r = updateWorkoutExerciseSchema.safeParse({
      params: { id: "p1", workoutId: "w1", exerciseId: "e1" },
      body: { order: 2 },
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty body", () => {
    const r = updateWorkoutExerciseSchema.safeParse({
      params: { id: "p1", workoutId: "w1", exerciseId: "e1" },
      body: {},
    });
    expect(r.success).toBe(false);
  });
});

describe("deleteWorkoutExerciseSchema", () => {
  it("accepts params", () => {
    const r = deleteWorkoutExerciseSchema.safeParse({
      params: { id: "p1", workoutId: "w1", exerciseId: "e1" },
    });
    expect(r.success).toBe(true);
  });

  it("rejects missing exerciseId", () => {
    const r = deleteWorkoutExerciseSchema.safeParse({
      params: { id: "p1", workoutId: "w1" },
    });
    expect(r.success).toBe(false);
  });
});

describe("bulkReorderWorkoutExercisesSchema", () => {
  it("accepts exercises list", () => {
    const r = bulkReorderWorkoutExercisesSchema.safeParse({
      params: { id: "p1", workoutId: "w1" },
      body: { exercises: [{ id: "e1", order: 1 }] },
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty exercises", () => {
    const r = bulkReorderWorkoutExercisesSchema.safeParse({
      params: { id: "p1", workoutId: "w1" },
      body: { exercises: [] },
    });
    expect(r.success).toBe(false);
  });
});
