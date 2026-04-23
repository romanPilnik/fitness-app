import { describe, expect, it } from "vitest";
import { SessionStatuses } from "@/generated/prisma/enums.js";
import {
  createSessionSchema,
  deleteSessionSchema,
  getSessionByIdSchema,
  getSessionsSchema,
} from "../session.validation.js";

const validSet = {
  reps: 10,
  weight: 50,
  rir: 1,
  setCompleted: true,
};

const validExercise = {
  exerciseId: "ex-1",
  order: 1,
  targetSets: 2,
  sets: [validSet],
};

const minimalSessionBody = {
  programId: "prog-1",
  programWorkoutId: "pw-1",
  workoutName: "Legs",
  dayNumber: 1,
  sessionStatus: SessionStatuses.completed,
  sessionDuration: 45,
  exercises: [validExercise],
};

describe("getSessionsSchema", () => {
  it("accepts empty query with defaults", () => {
    const r = getSessionsSchema.safeParse({ query: {} });
    expect(r.success).toBe(true);
  });

  it("filters by status", () => {
    const r = getSessionsSchema.safeParse({
      query: { sessionStatus: SessionStatuses.partially },
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const r = getSessionsSchema.safeParse({
      query: { sessionStatus: "nope" },
    });
    expect(r.success).toBe(false);
  });

  it("accepts programId and date range", () => {
    const r = getSessionsSchema.safeParse({
      query: {
        programId: "prog-1",
        dateFrom: "2025-01-01T00:00:00.000Z",
        dateTo: "2025-01-31T23:59:59.999Z",
      },
    });
    expect(r.success).toBe(true);
  });

  it("rejects dateFrom after dateTo", () => {
    const r = getSessionsSchema.safeParse({
      query: {
        dateFrom: "2025-02-01T00:00:00.000Z",
        dateTo: "2025-01-01T00:00:00.000Z",
      },
    });
    expect(r.success).toBe(false);
  });
});

describe("getSessionByIdSchema", () => {
  it("accepts id", () => {
    const r = getSessionByIdSchema.safeParse({ params: { id: "s1" } });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    const r = getSessionByIdSchema.safeParse({ params: {} });
    expect(r.success).toBe(false);
  });
});

describe("createSessionSchema", () => {
  it("accepts valid body", () => {
    const r = createSessionSchema.safeParse({ body: minimalSessionBody });
    expect(r.success).toBe(true);
  });

  it("rejects duration over max", () => {
    const r = createSessionSchema.safeParse({
      body: { ...minimalSessionBody, sessionDuration: 601 },
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty exercises", () => {
    const r = createSessionSchema.safeParse({
      body: { ...minimalSessionBody, exercises: [] },
    });
    expect(r.success).toBe(false);
  });
});

describe("deleteSessionSchema", () => {
  it("accepts id", () => {
    const r = deleteSessionSchema.safeParse({ params: { id: "s1" } });
    expect(r.success).toBe(true);
  });

  it("rejects missing id", () => {
    const r = deleteSessionSchema.safeParse({ params: {} });
    expect(r.success).toBe(false);
  });
});
