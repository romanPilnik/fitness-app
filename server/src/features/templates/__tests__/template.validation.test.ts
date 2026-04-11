import { describe, expect, it } from "vitest";
import { Difficulty, Goal, SplitType } from "@/generated/prisma/enums.js";
import {
  createTemplateSchema,
  deleteTemplateSchema,
  getTemplateByIdSchema,
  getTemplatesSchema,
  updateTemplateSchema,
} from "../template.validation.js";

const minimalWorkout = {
  name: "Day 1",
  dayNumber: 1,
  exercises: [
    {
      exerciseId: "ex-1",
      order: 1,
      targetSets: 3,
    },
  ],
};

const minimalCreateBody = {
  name: "T1",
  daysPerWeek: 3,
  difficulty: Difficulty.beginner,
  splitType: SplitType.full_body,
  goal: Goal.strength,
  workouts: [minimalWorkout],
};

describe("getTemplatesSchema", () => {
  it("accepts empty query with pagination defaults", () => {
    const r = getTemplatesSchema.safeParse({ query: {} });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.query.limit).toBe(20);
      expect(r.data.query.sort).toBe("created_desc");
    }
  });

  it("accepts filters", () => {
    const r = getTemplatesSchema.safeParse({
      query: {
        splitType: SplitType.upper_lower,
        difficulty: Difficulty.advanced,
        goal: Goal.hypertrophy,
        myTemplatesOnly: "true",
        daysPerWeek: "4",
        sort: "name_desc",
      },
    });
    expect(r.success).toBe(true);
  });

  it("rejects daysPerWeek out of range", () => {
    const r = getTemplatesSchema.safeParse({
      query: { daysPerWeek: 99 },
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid sort", () => {
    const r = getTemplatesSchema.safeParse({
      query: { sort: "bogus" },
    });
    expect(r.success).toBe(false);
  });
});

describe("getTemplateByIdSchema", () => {
  it("accepts id param", () => {
    const r = getTemplateByIdSchema.safeParse({ params: { id: "t1" } });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    const r = getTemplateByIdSchema.safeParse({ params: {} });
    expect(r.success).toBe(false);
  });
});

describe("createTemplateSchema", () => {
  it("accepts valid body", () => {
    const r = createTemplateSchema.safeParse({ body: minimalCreateBody });
    expect(r.success).toBe(true);
  });

  it("rejects empty workouts", () => {
    const r = createTemplateSchema.safeParse({
      body: { ...minimalCreateBody, workouts: [] },
    });
    expect(r.success).toBe(false);
  });
});

describe("updateTemplateSchema", () => {
  it("accepts partial update when non-empty", () => {
    const r = updateTemplateSchema.safeParse({
      params: { id: "t1" },
      body: { name: "Renamed" },
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty body object", () => {
    const r = updateTemplateSchema.safeParse({
      params: { id: "t1" },
      body: {},
    });
    expect(r.success).toBe(false);
  });
});

describe("deleteTemplateSchema", () => {
  it("accepts id", () => {
    const r = deleteTemplateSchema.safeParse({ params: { id: "t1" } });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    const r = deleteTemplateSchema.safeParse({ params: {} });
    expect(r.success).toBe(false);
  });
});
