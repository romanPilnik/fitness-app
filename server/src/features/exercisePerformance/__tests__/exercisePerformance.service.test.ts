import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/errors/index.js";
import { ERROR_CODES } from "@/types/error.types.js";

const prismaMock = vi.hoisted(() => ({
  exercise: {
    findUnique: vi.fn(),
  },
  sessionExercise: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
  },
}));
vi.mock("@/lib/prisma.js", () => ({ prisma: prismaMock }));

import { getExercisePerformanceSummary } from "../exercisePerformance.service.js";

const fakeExercise = {
  id: "ex-1",
  name: "Bench Press",
  primaryMuscle: "chest" as const,
  equipment: "barbell" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("getExercisePerformanceSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws NotFoundError when exercise does not exist", async () => {
    prismaMock.exercise.findUnique.mockResolvedValue(null);

    await expect(
      getExercisePerformanceSummary({
        userId: "u-1",
        exerciseId: "missing",
      }),
    ).rejects.toThrow(NotFoundError);

    await expect(
      getExercisePerformanceSummary({
        userId: "u-1",
        exerciseId: "missing",
      }),
    ).rejects.toMatchObject({ code: ERROR_CODES.EXERCISE_NOT_FOUND });

    expect(prismaMock.sessionExercise.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.sessionExercise.findMany).not.toHaveBeenCalled();
  });

  it("returns summary with exercise snippet and empty performance when user has no sessions for exercise", async () => {
    prismaMock.exercise.findUnique.mockResolvedValue(fakeExercise);
    prismaMock.sessionExercise.findFirst.mockResolvedValue(null);
    prismaMock.sessionExercise.findMany.mockResolvedValue([]);

    const result = await getExercisePerformanceSummary({
      userId: "u-1",
      exerciseId: "ex-1",
    });

    expect(prismaMock.exercise.findUnique).toHaveBeenCalledWith({
      where: { id: "ex-1" },
    });
    expect(result).toEqual({
      exerciseId: "ex-1",
      exercise: {
        id: "ex-1",
        name: "Bench Press",
        primaryMuscle: "chest",
        equipment: "barbell",
      },
      lastPerformed: null,
      personalRecord: null,
      recentHistory: [],
    });
  });
});
