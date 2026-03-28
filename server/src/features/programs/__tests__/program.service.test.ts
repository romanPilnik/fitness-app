import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "@/errors/index.js";
import { ERROR_CODES } from "@/types/error.types.js";

const prismaMock = vi.hoisted(() => ({
  program: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  template: {
    findUnique: vi.fn(),
  },
  programWorkout: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  programWorkoutExercise: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  $transaction: vi.fn(),
}));
vi.mock("@/lib/prisma.js", () => ({ prisma: prismaMock }));

import { ProgramService } from "../program.service.js";

const fakeProgram = {
  id: "p-1",
  name: "My Program",
  userId: "u-1",
  sourceTemplateId: null,
  sourceTemplateName: null,
  createdFrom: "scratch",
  description: null,
  difficulty: "intermediate",
  goal: "hypertrophy",
  splitType: "push_pull_legs",
  daysPerWeek: 6,
  status: "active",
  startDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const fakeTemplate = {
  id: "t-1",
  name: "Template",
  description: "desc",
  daysPerWeek: 3,
  difficulty: "beginner",
  goal: "strength",
  splitType: "full_body",
  createdByUserId: null,
  workouts: [
    {
      name: "Day 1",
      dayNumber: 1,
      exercises: [{ exerciseId: "ex-1", order: 1, targetSets: 3, notes: null }],
    },
  ],
};

describe("ProgramService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPrograms", () => {
    it("returns paginated results for user", async () => {
      prismaMock.program.findMany.mockResolvedValue([fakeProgram]);

      const result = await ProgramService.getPrograms({
        userId: "u-1",
        limit: 20,
      });

      expect(prismaMock.program.findMany).toHaveBeenCalled();
      const programFindCall = prismaMock.program.findMany.mock.calls[0];
      if (programFindCall === undefined) {
        throw new Error("expected program.findMany mock call");
      }
      const findArgs = programFindCall[0] as { where: { userId: string } };
      expect(findArgs.where.userId).toBe("u-1");
      expect(result.data).toHaveLength(1);
    });
  });

  describe("createFromTemplate", () => {
    it("creates a program from a template", async () => {
      prismaMock.template.findUnique.mockResolvedValue(fakeTemplate);
      prismaMock.program.findFirst.mockResolvedValue(null);
      prismaMock.program.create.mockResolvedValue({
        ...fakeProgram,
        sourceTemplateId: "t-1",
      });

      const result = await ProgramService.createFromTemplate({
        userId: "u-1",
        templateId: "t-1",
      });

      expect(prismaMock.template.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "t-1" },
          include: { workouts: { include: { exercises: true } } },
        }),
      );
      expect(prismaMock.program.create).toHaveBeenCalled();
      expect(result.sourceTemplateId).toBe("t-1");
    });

    it("throws NotFoundError when template does not exist", async () => {
      prismaMock.template.findUnique.mockResolvedValue(null);

      await expect(
        ProgramService.createFromTemplate({
          userId: "u-1",
          templateId: "nope",
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws ConflictError when program name already exists", async () => {
      prismaMock.template.findUnique.mockResolvedValue(fakeTemplate);
      prismaMock.program.findFirst.mockResolvedValue(fakeProgram);

      await expect(
        ProgramService.createFromTemplate({
          userId: "u-1",
          templateId: "t-1",
        }),
      ).rejects.toThrow(ConflictError);

      await expect(
        ProgramService.createFromTemplate({
          userId: "u-1",
          templateId: "t-1",
        }),
      ).rejects.toMatchObject({ code: ERROR_CODES.PROGRAM_NAME_EXISTS });
    });

    it("uses provided name over template name", async () => {
      prismaMock.template.findUnique.mockResolvedValue(fakeTemplate);
      prismaMock.program.findFirst.mockResolvedValue(null);
      prismaMock.program.create.mockResolvedValue(fakeProgram);

      await ProgramService.createFromTemplate({
        userId: "u-1",
        templateId: "t-1",
        name: "Custom Name",
      });

      expect(prismaMock.program.findFirst).toHaveBeenCalledWith({
        where: { userId: "u-1", name: "Custom Name" },
      });
    });
  });

  describe("createCustomProgram", () => {
    it("creates a custom program", async () => {
      prismaMock.program.findFirst.mockResolvedValue(null);
      prismaMock.program.create.mockResolvedValue(fakeProgram);

      const result = await ProgramService.createCustomProgram({
        userId: "u-1",
        name: "My Program",
        difficulty: "intermediate" as never,
        goal: "hypertrophy" as never,
        splitType: "push_pull_legs" as never,
        daysPerWeek: 6,
        workouts: [],
      });

      expect(result).toEqual(fakeProgram);
    });

    it("throws ConflictError when program name exists", async () => {
      prismaMock.program.findFirst.mockResolvedValue(fakeProgram);

      await expect(
        ProgramService.createCustomProgram({
          userId: "u-1",
          name: "My Program",
          difficulty: "intermediate" as never,
          goal: "hypertrophy" as never,
          splitType: "push_pull_legs" as never,
          daysPerWeek: 6,
          workouts: [],
        }),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe("getActiveProgram", () => {
    it("returns active programs for user", async () => {
      prismaMock.program.findMany.mockResolvedValue([fakeProgram]);

      const result = await ProgramService.getActiveProgram({ userId: "u-1" });

      expect(prismaMock.program.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "u-1", status: "active" },
        }),
      );
      expect(result).toHaveLength(1);
    });
  });

  describe("getProgramById", () => {
    it("returns program when found", async () => {
      prismaMock.program.findUnique.mockResolvedValue(fakeProgram);

      const result = await ProgramService.getProgramById({
        programId: "p-1",
        userId: "u-1",
      });

      expect(result).toEqual(fakeProgram);
    });

    it("throws NotFoundError when program does not exist", async () => {
      prismaMock.program.findUnique.mockResolvedValue(null);

      await expect(
        ProgramService.getProgramById({ programId: "nope", userId: "u-1" }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("updateProgram", () => {
    it("updates program when user owns it", async () => {
      prismaMock.program.findUnique.mockResolvedValue(fakeProgram);
      prismaMock.program.update.mockResolvedValue({
        ...fakeProgram,
        name: "Updated",
      });

      const result = await ProgramService.updateProgram({
        programId: "p-1",
        userId: "u-1",
        name: "Updated",
      });

      expect(result.name).toBe("Updated");
    });

    it("throws NotFoundError when user does not own program", async () => {
      prismaMock.program.findUnique.mockResolvedValue(fakeProgram);

      await expect(
        ProgramService.updateProgram({
          programId: "p-1",
          userId: "other",
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws NotFoundError when program does not exist", async () => {
      prismaMock.program.findUnique.mockResolvedValue(null);

      await expect(
        ProgramService.updateProgram({
          programId: "missing",
          userId: "u-1",
          name: "Nope",
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteProgram", () => {
    it("deletes when user owns the program", async () => {
      prismaMock.program.findUnique.mockResolvedValue(fakeProgram);
      prismaMock.program.delete.mockResolvedValue(undefined);

      await ProgramService.deleteProgram({ programId: "p-1", userId: "u-1" });

      expect(prismaMock.program.delete).toHaveBeenCalledWith({
        where: { id: "p-1" },
      });
    });

    it("throws NotFoundError when user does not own program", async () => {
      prismaMock.program.findUnique.mockResolvedValue(fakeProgram);

      await expect(
        ProgramService.deleteProgram({ programId: "p-1", userId: "other" }),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws NotFoundError when program does not exist", async () => {
      prismaMock.program.findUnique.mockResolvedValue(null);

      await expect(
        ProgramService.deleteProgram({ programId: "missing", userId: "u-1" }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("addProgramWorkout", () => {
    it("creates a workout when user owns program", async () => {
      prismaMock.program.findUnique.mockResolvedValue(fakeProgram);
      const workout = {
        id: "w-1",
        programId: "p-1",
        name: "Leg Day",
        dayNumber: 1,
      };
      prismaMock.programWorkout.create.mockResolvedValue(workout);

      const result = await ProgramService.addProgramWorkout({
        programId: "p-1",
        userId: "u-1",
        name: "Leg Day",
        dayNumber: 1,
      });

      expect(result).toEqual(workout);
    });

    it("throws NotFoundError when user does not own program", async () => {
      prismaMock.program.findUnique.mockResolvedValue(fakeProgram);

      await expect(
        ProgramService.addProgramWorkout({
          programId: "p-1",
          userId: "other",
          name: "Day",
          dayNumber: 1,
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws NotFoundError when program does not exist", async () => {
      prismaMock.program.findUnique.mockResolvedValue(null);

      await expect(
        ProgramService.addProgramWorkout({
          programId: "missing",
          userId: "u-1",
          name: "Day",
          dayNumber: 1,
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("updateProgramWorkout", () => {
    it("updates workout when found", async () => {
      prismaMock.program.findUnique.mockResolvedValue(fakeProgram);
      prismaMock.programWorkout.findUnique.mockResolvedValue({ id: "w-1" });
      prismaMock.programWorkout.update.mockResolvedValue({
        id: "w-1",
        name: "Push",
      });

      const result = await ProgramService.updateProgramWorkout({
        programId: "p-1",
        workoutId: "w-1",
        userId: "u-1",
        name: "Push",
      });

      expect(result.name).toBe("Push");
    });

    it("throws NotFoundError when workout does not exist", async () => {
      prismaMock.program.findUnique.mockResolvedValue(fakeProgram);
      prismaMock.programWorkout.findUnique.mockResolvedValue(null);

      await expect(
        ProgramService.updateProgramWorkout({
          programId: "p-1",
          workoutId: "nope",
          userId: "u-1",
        }),
      ).rejects.toThrow(NotFoundError);

      await expect(
        ProgramService.updateProgramWorkout({
          programId: "p-1",
          workoutId: "nope",
          userId: "u-1",
        }),
      ).rejects.toMatchObject({ code: ERROR_CODES.WORKOUT_NOT_FOUND });
    });

    it("throws NotFoundError when program does not exist", async () => {
      prismaMock.program.findUnique.mockResolvedValue(null);

      await expect(
        ProgramService.updateProgramWorkout({
          programId: "missing",
          workoutId: "w-1",
          userId: "u-1",
          name: "Push",
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteProgramWorkout", () => {
    it("deletes workout when found", async () => {
      prismaMock.program.findUnique.mockResolvedValue(fakeProgram);
      prismaMock.programWorkout.findUnique.mockResolvedValue({ id: "w-1" });
      prismaMock.programWorkout.delete.mockResolvedValue(undefined);

      await ProgramService.deleteProgramWorkout({
        programId: "p-1",
        workoutId: "w-1",
        userId: "u-1",
      });

      expect(prismaMock.programWorkout.delete).toHaveBeenCalledWith({
        where: { id: "w-1" },
      });
    });

    it("throws NotFoundError when workout does not exist", async () => {
      prismaMock.program.findUnique.mockResolvedValue(fakeProgram);
      prismaMock.programWorkout.findUnique.mockResolvedValue(null);

      await expect(
        ProgramService.deleteProgramWorkout({
          programId: "p-1",
          workoutId: "nope",
          userId: "u-1",
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws NotFoundError when program does not exist", async () => {
      prismaMock.program.findUnique.mockResolvedValue(null);

      await expect(
        ProgramService.deleteProgramWorkout({
          programId: "missing",
          workoutId: "w-1",
          userId: "u-1",
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("addWorkoutExercise", () => {
    it("creates exercise when order is unique", async () => {
      prismaMock.program.findUnique.mockResolvedValue(fakeProgram);
      prismaMock.programWorkout.findUnique.mockResolvedValue({ id: "w-1" });
      prismaMock.programWorkoutExercise.findFirst.mockResolvedValue(null);
      const created = { id: "we-1", exerciseId: "ex-1", order: 1 };
      prismaMock.programWorkoutExercise.create.mockResolvedValue(created);

      const result = await ProgramService.addWorkoutExercise({
        programId: "p-1",
        workoutId: "w-1",
        userId: "u-1",
        exerciseId: "ex-1",
        order: 1,
        targetSets: 3,
      });

      expect(result).toEqual(created);
    });

    it("throws ConflictError when order already exists", async () => {
      prismaMock.program.findUnique.mockResolvedValue(fakeProgram);
      prismaMock.programWorkout.findUnique.mockResolvedValue({ id: "w-1" });
      prismaMock.programWorkoutExercise.findFirst.mockResolvedValue({
        id: "existing",
      });

      await expect(
        ProgramService.addWorkoutExercise({
          programId: "p-1",
          workoutId: "w-1",
          userId: "u-1",
          exerciseId: "ex-1",
          order: 1,
          targetSets: 3,
        }),
      ).rejects.toThrow(ConflictError);

      await expect(
        ProgramService.addWorkoutExercise({
          programId: "p-1",
          workoutId: "w-1",
          userId: "u-1",
          exerciseId: "ex-1",
          order: 1,
          targetSets: 3,
        }),
      ).rejects.toMatchObject({ code: ERROR_CODES.DUPLICATE_VALUE });
    });

    it("throws NotFoundError when workout does not exist", async () => {
      prismaMock.program.findUnique.mockResolvedValue(fakeProgram);
      prismaMock.programWorkout.findUnique.mockResolvedValue(null);

      await expect(
        ProgramService.addWorkoutExercise({
          programId: "p-1",
          workoutId: "nope",
          userId: "u-1",
          exerciseId: "ex-1",
          order: 1,
          targetSets: 3,
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws NotFoundError when program does not exist", async () => {
      prismaMock.program.findUnique.mockResolvedValue(null);

      await expect(
        ProgramService.addWorkoutExercise({
          programId: "missing",
          workoutId: "w-1",
          userId: "u-1",
          exerciseId: "ex-1",
          order: 1,
          targetSets: 3,
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("updateWorkoutExercise", () => {
    it("updates exercise when found", async () => {
      prismaMock.program.findUnique.mockResolvedValue(fakeProgram);
      prismaMock.programWorkout.findUnique.mockResolvedValue({ id: "w-1" });
      prismaMock.programWorkoutExercise.findUnique.mockResolvedValue({
        id: "we-1",
      });
      prismaMock.programWorkoutExercise.update.mockResolvedValue({
        id: "we-1",
        targetSets: 5,
      });

      const result = await ProgramService.updateWorkoutExercise({
        programId: "p-1",
        workoutId: "w-1",
        workoutExerciseId: "we-1",
        userId: "u-1",
        targetSets: 5,
      });

      expect(result.targetSets).toBe(5);
    });

    it("throws NotFoundError when exercise does not exist", async () => {
      prismaMock.program.findUnique.mockResolvedValue(fakeProgram);
      prismaMock.programWorkout.findUnique.mockResolvedValue({ id: "w-1" });
      prismaMock.programWorkoutExercise.findUnique.mockResolvedValue(null);

      await expect(
        ProgramService.updateWorkoutExercise({
          programId: "p-1",
          workoutId: "w-1",
          workoutExerciseId: "nope",
          userId: "u-1",
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws NotFoundError when program does not exist", async () => {
      prismaMock.program.findUnique.mockResolvedValue(null);

      await expect(
        ProgramService.updateWorkoutExercise({
          programId: "missing",
          workoutId: "w-1",
          workoutExerciseId: "we-1",
          userId: "u-1",
          targetSets: 5,
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteWorkoutExercise", () => {
    it("deletes exercise when found", async () => {
      prismaMock.program.findUnique.mockResolvedValue(fakeProgram);
      prismaMock.programWorkout.findUnique.mockResolvedValue({ id: "w-1" });
      prismaMock.programWorkoutExercise.findUnique.mockResolvedValue({
        id: "we-1",
      });
      prismaMock.programWorkoutExercise.delete.mockResolvedValue(undefined);

      await ProgramService.deleteWorkoutExercise({
        programId: "p-1",
        workoutId: "w-1",
        workoutExerciseId: "we-1",
        userId: "u-1",
      });

      expect(prismaMock.programWorkoutExercise.delete).toHaveBeenCalledWith({
        where: { id: "we-1" },
      });
    });

    it("throws NotFoundError when exercise does not exist", async () => {
      prismaMock.program.findUnique.mockResolvedValue(fakeProgram);
      prismaMock.programWorkout.findUnique.mockResolvedValue({ id: "w-1" });
      prismaMock.programWorkoutExercise.findUnique.mockResolvedValue(null);

      await expect(
        ProgramService.deleteWorkoutExercise({
          programId: "p-1",
          workoutId: "w-1",
          workoutExerciseId: "nope",
          userId: "u-1",
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws NotFoundError when program does not exist", async () => {
      prismaMock.program.findUnique.mockResolvedValue(null);

      await expect(
        ProgramService.deleteWorkoutExercise({
          programId: "missing",
          workoutId: "w-1",
          workoutExerciseId: "we-1",
          userId: "u-1",
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("bulkReorderWorkoutExercises", () => {
    it("reorders exercises in a transaction", async () => {
      prismaMock.program.findUnique.mockResolvedValue(fakeProgram);
      prismaMock.programWorkout.findUnique.mockResolvedValue({ id: "w-1" });
      prismaMock.programWorkoutExercise.findMany.mockResolvedValue([
        { id: "we-1" },
        { id: "we-2" },
      ]);
      prismaMock.$transaction.mockResolvedValue([{}, {}]);

      await ProgramService.bulkReorderWorkoutExercises({
        programId: "p-1",
        workoutId: "w-1",
        userId: "u-1",
        exercises: [
          { id: "we-1", order: 2 },
          { id: "we-2", order: 1 },
        ],
      });

      expect(prismaMock.$transaction).toHaveBeenCalled();
    });

    it("throws BadRequestError when exercise count does not match", async () => {
      prismaMock.program.findUnique.mockResolvedValue(fakeProgram);
      prismaMock.programWorkout.findUnique.mockResolvedValue({ id: "w-1" });
      prismaMock.programWorkoutExercise.findMany.mockResolvedValue([
        { id: "we-1" },
        { id: "we-2" },
      ]);

      await expect(
        ProgramService.bulkReorderWorkoutExercises({
          programId: "p-1",
          workoutId: "w-1",
          userId: "u-1",
          exercises: [{ id: "we-1", order: 1 }],
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("throws BadRequestError when an exercise id does not belong to workout", async () => {
      prismaMock.program.findUnique.mockResolvedValue(fakeProgram);
      prismaMock.programWorkout.findUnique.mockResolvedValue({ id: "w-1" });
      prismaMock.programWorkoutExercise.findMany.mockResolvedValue([
        { id: "we-1" },
        { id: "we-2" },
      ]);

      await expect(
        ProgramService.bulkReorderWorkoutExercises({
          programId: "p-1",
          workoutId: "w-1",
          userId: "u-1",
          exercises: [
            { id: "we-1", order: 1 },
            { id: "foreign", order: 2 },
          ],
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("throws BadRequestError when orders contain duplicates", async () => {
      prismaMock.program.findUnique.mockResolvedValue(fakeProgram);
      prismaMock.programWorkout.findUnique.mockResolvedValue({ id: "w-1" });
      prismaMock.programWorkoutExercise.findMany.mockResolvedValue([
        { id: "we-1" },
        { id: "we-2" },
      ]);

      await expect(
        ProgramService.bulkReorderWorkoutExercises({
          programId: "p-1",
          workoutId: "w-1",
          userId: "u-1",
          exercises: [
            { id: "we-1", order: 1 },
            { id: "we-2", order: 1 },
          ],
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("throws NotFoundError when workout does not exist", async () => {
      prismaMock.program.findUnique.mockResolvedValue(fakeProgram);
      prismaMock.programWorkout.findUnique.mockResolvedValue(null);

      await expect(
        ProgramService.bulkReorderWorkoutExercises({
          programId: "p-1",
          workoutId: "nope",
          userId: "u-1",
          exercises: [],
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws NotFoundError when program does not exist", async () => {
      prismaMock.program.findUnique.mockResolvedValue(null);

      await expect(
        ProgramService.bulkReorderWorkoutExercises({
          programId: "missing",
          workoutId: "w-1",
          userId: "u-1",
          exercises: [],
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws NotFoundError when user does not own program", async () => {
      prismaMock.program.findUnique.mockResolvedValue(fakeProgram);

      await expect(
        ProgramService.bulkReorderWorkoutExercises({
          programId: "p-1",
          workoutId: "w-1",
          userId: "other",
          exercises: [],
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
