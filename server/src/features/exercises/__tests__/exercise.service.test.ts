import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError, AuthorizationError } from "@/errors/index.js";
import { ERROR_CODES } from "@/types/error.types.js";

const prismaMock = vi.hoisted(() => ({
  exercise: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));
vi.mock("@/lib/prisma.js", () => ({ prisma: prismaMock }));

import { ExerciseService } from "../exercise.service.js";

const fakeExercise = {
  id: "ex-1",
  name: "Bench Press",
  category: "compound",
  equipment: "barbell",
  movementPattern: "horizontal_push",
  primaryMuscle: "chest",
  secondaryMuscles: ["triceps"],
  instructions: null,
  createdByUserId: "u-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("ExerciseService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getExercises", () => {
    it("returns paginated results", async () => {
      const items = [
        { ...fakeExercise, id: "ex-1" },
        { ...fakeExercise, id: "ex-2" },
      ];
      prismaMock.exercise.findMany.mockResolvedValue(items);

      const result = await ExerciseService.getExercises({
        limit: 20,
        userId: "u-1",
        sort: "name_asc",
      });

      expect(prismaMock.exercise.findMany).toHaveBeenCalled();
      const firstFind = prismaMock.exercise.findMany.mock.calls[0];
      if (firstFind === undefined) {
        throw new Error("expected exercise.findMany mock call");
      }
      const findArgs = firstFind[0] as {
        where: { OR: { createdByUserId: string | null }[] };
      };
      expect(findArgs.where.OR).toEqual([
        { createdByUserId: null },
        { createdByUserId: "u-1" },
      ]);
      expect(result.data).toHaveLength(2);
      expect(result.hasMore).toBe(false);
    });

    it("sets hasMore when items exceed limit", async () => {
      const items = Array.from({ length: 3 }, (_, i) => ({
        ...fakeExercise,
        id: `ex-${String(i)}`,
      }));
      prismaMock.exercise.findMany.mockResolvedValue(items);

      const result = await ExerciseService.getExercises({
        limit: 2,
        userId: "u-1",
        sort: "name_asc",
      });

      expect(result.hasMore).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.nextCursor).toBe("ex-1");
    });
  });

  describe("getExerciseById", () => {
    it("returns the exercise when found and visible (owner)", async () => {
      prismaMock.exercise.findUnique.mockResolvedValue(fakeExercise);

      const result = await ExerciseService.getExerciseById({
        id: "ex-1",
        userId: "u-1",
      });

      expect(result).toEqual(fakeExercise);
    });

    it("returns the exercise when found and visible (system exercise)", async () => {
      const systemExercise = { ...fakeExercise, createdByUserId: null };
      prismaMock.exercise.findUnique.mockResolvedValue(systemExercise);

      const result = await ExerciseService.getExerciseById({
        id: "ex-1",
        userId: "u-1",
      });

      expect(result).toEqual(systemExercise);
    });

    it("throws NotFoundError when exercise does not exist", async () => {
      prismaMock.exercise.findUnique.mockResolvedValue(null);

      await expect(
        ExerciseService.getExerciseById({ id: "nope", userId: "u-1" }),
      ).rejects.toThrow(NotFoundError);

      await expect(
        ExerciseService.getExerciseById({ id: "nope", userId: "u-1" }),
      ).rejects.toMatchObject({ code: ERROR_CODES.EXERCISE_NOT_FOUND });
    });

    it("throws NotFoundError when exercise is owned by another user", async () => {
      prismaMock.exercise.findUnique.mockResolvedValue(fakeExercise);

      await expect(
        ExerciseService.getExerciseById({ id: "ex-1", userId: "other-user" }),
      ).rejects.toThrow(NotFoundError);

      await expect(
        ExerciseService.getExerciseById({ id: "ex-1", userId: "other-user" }),
      ).rejects.toMatchObject({ code: ERROR_CODES.EXERCISE_NOT_FOUND });
    });
  });

  describe("createExercise", () => {
    it("creates and returns the exercise", async () => {
      prismaMock.exercise.create.mockResolvedValue(fakeExercise);

      const result = await ExerciseService.createExercise({
        name: "Bench Press",
        equipment: "barbell" as never,
        primaryMuscle: "chest" as never,
        category: "compound" as never,
        movementPattern: "horizontal_push" as never,
        createdByUserId: "u-1",
      });

      expect(prismaMock.exercise.create).toHaveBeenCalled();
      const createCall = prismaMock.exercise.create.mock.calls[0];
      if (createCall === undefined) {
        throw new Error("expected exercise.create mock call");
      }
      const createArgs = createCall[0] as { data: { name: string } };
      expect(createArgs.data.name).toBe("Bench Press");
      expect(result).toEqual(fakeExercise);
    });
  });

  describe("updateExercise", () => {
    it("updates when user owns the exercise", async () => {
      prismaMock.exercise.findUnique.mockResolvedValue(fakeExercise);
      prismaMock.exercise.update.mockResolvedValue({
        ...fakeExercise,
        name: "Incline Bench",
      });

      const result = await ExerciseService.updateExercise({
        id: "ex-1",
        userId: "u-1",
        name: "Incline Bench",
      });

      expect(prismaMock.exercise.update).toHaveBeenCalled();
      const updateCall = prismaMock.exercise.update.mock.calls[0];
      if (updateCall === undefined) {
        throw new Error("expected exercise.update mock call");
      }
      const updateArgs = updateCall[0] as {
        where: { id: string };
        data: { name: string };
      };
      expect(updateArgs.where.id).toBe("ex-1");
      expect(updateArgs.data.name).toBe("Incline Bench");
      expect(result.name).toBe("Incline Bench");
    });

    it("throws NotFoundError when exercise does not exist", async () => {
      prismaMock.exercise.findUnique.mockResolvedValue(null);

      await expect(
        ExerciseService.updateExercise({ id: "nope", userId: "u-1" }),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws AuthorizationError when user does not own the exercise", async () => {
      prismaMock.exercise.findUnique.mockResolvedValue(fakeExercise);

      await expect(
        ExerciseService.updateExercise({ id: "ex-1", userId: "other-user" }),
      ).rejects.toThrow(AuthorizationError);

      await expect(
        ExerciseService.updateExercise({ id: "ex-1", userId: "other-user" }),
      ).rejects.toMatchObject({ code: ERROR_CODES.INSUFFICIENT_PERMISSIONS });
    });
  });

  describe("deleteExercise", () => {
    it("deletes when user owns the exercise", async () => {
      prismaMock.exercise.findUnique.mockResolvedValue(fakeExercise);
      prismaMock.exercise.delete.mockResolvedValue(undefined);

      await ExerciseService.deleteExercise({ id: "ex-1", userId: "u-1" });

      expect(prismaMock.exercise.delete).toHaveBeenCalledWith({
        where: { id: "ex-1" },
      });
    });

    it("throws NotFoundError when exercise does not exist", async () => {
      prismaMock.exercise.findUnique.mockResolvedValue(null);

      await expect(
        ExerciseService.deleteExercise({ id: "nope", userId: "u-1" }),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws AuthorizationError when user does not own the exercise", async () => {
      prismaMock.exercise.findUnique.mockResolvedValue(fakeExercise);

      await expect(
        ExerciseService.deleteExercise({ id: "ex-1", userId: "other-user" }),
      ).rejects.toThrow(AuthorizationError);
    });
  });
});
