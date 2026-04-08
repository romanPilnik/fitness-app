import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthenticationError } from "@/errors/index.js";

const mockProgramService = vi.hoisted(() => ({
  getPrograms: vi.fn(),
  getActiveProgram: vi.fn(),
  getProgramById: vi.fn(),
  createFromTemplate: vi.fn(),
  createCustomProgram: vi.fn(),
  updateProgram: vi.fn(),
  deleteProgram: vi.fn(),
  addProgramWorkout: vi.fn(),
  updateProgramWorkout: vi.fn(),
  deleteProgramWorkout: vi.fn(),
  addWorkoutExercise: vi.fn(),
  updateWorkoutExercise: vi.fn(),
  deleteWorkoutExercise: vi.fn(),
  bulkReorderWorkoutExercises: vi.fn(),
}));
vi.mock("../program.service.js", () => ({
  ProgramService: mockProgramService,
}));

const mockSendSuccess = vi.hoisted(() => vi.fn());
vi.mock("@/utils/response.js", () => ({ sendSuccess: mockSendSuccess }));

import { ProgramController } from "../program.controller.js";

function asReqFor<M extends (req: never, res: Response) => unknown>(
  _method: M,
  req: Request,
): Parameters<M>[0] {
  return req as Parameters<M>[0];
}

const fakeUser = {
  id: "u-1",
  email: "a@b.com",
  name: "Test",
  role: "user" as const,
  isActive: true,
  units: "metric" as const,
  weekStartsOn: "sunday" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    user: fakeUser,
    body: {},
    query: {},
    params: {},
    ...overrides,
  } as unknown as Request;
}
const res = {} as Response;

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- M ties each handler to Parameters<M>[0] for the mock request
function expectAuthGuard<M extends (req: never, res: Response) => unknown>(
  fn: M,
) {
  it("throws AuthenticationError when req.user is missing", async () => {
    await expect(
      (fn as (req: Parameters<M>[0], res: Response) => Promise<unknown>)(
        asReqFor(fn, mockReq({ user: undefined } as Partial<Request>)),
        res,
      ),
    ).rejects.toThrow(AuthenticationError);
  });
}

describe("ProgramController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPrograms", () => {
    expectAuthGuard(ProgramController.getPrograms);

    it("passes query and userId to service", async () => {
      const page = { data: [], nextCursor: null, hasMore: false };
      mockProgramService.getPrograms.mockResolvedValue(page);

      await ProgramController.getPrograms(
        asReqFor(
          ProgramController.getPrograms,
          mockReq({ query: { status: "active", sort: "created_desc" } as never }),
        ),
        res,
      );

      expect(mockProgramService.getPrograms).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "active",
          userId: "u-1",
          sort: "created_desc",
        }),
      );
      expect(mockSendSuccess).toHaveBeenCalledWith(
        res,
        page,
        200,
        "Programs retrieved",
      );
    });
  });

  describe("getActiveProgram", () => {
    expectAuthGuard(ProgramController.getActiveProgram);

    it("passes userId to service", async () => {
      mockProgramService.getActiveProgram.mockResolvedValue([]);

      await ProgramController.getActiveProgram(
        asReqFor(ProgramController.getActiveProgram, mockReq()),
        res,
      );

      expect(mockProgramService.getActiveProgram).toHaveBeenCalledWith({
        userId: "u-1",
      });
    });
  });

  describe("getProgramById", () => {
    expectAuthGuard(ProgramController.getProgramById);

    it("passes programId and userId to service", async () => {
      mockProgramService.getProgramById.mockResolvedValue({ id: "p-1" });

      await ProgramController.getProgramById(
        asReqFor(
          ProgramController.getProgramById,
          mockReq({ params: { id: "p-1" } as never }),
        ),
        res,
      );

      expect(mockProgramService.getProgramById).toHaveBeenCalledWith({
        programId: "p-1",
        userId: "u-1",
      });
    });
  });

  describe("createFromTemplate", () => {
    expectAuthGuard(ProgramController.createFromTemplate);

    it("passes body fields and userId to service", async () => {
      mockProgramService.createFromTemplate.mockResolvedValue({ id: "p-1" });

      await ProgramController.createFromTemplate(
        asReqFor(
          ProgramController.createFromTemplate,
          mockReq({
            body: { templateId: "t-1", name: "My Prog" },
          } as Partial<Request>),
        ),
        res,
      );

      expect(mockProgramService.createFromTemplate).toHaveBeenCalledWith({
        userId: "u-1",
        templateId: "t-1",
        name: "My Prog",
        startDate: undefined,
      });
      expect(mockSendSuccess).toHaveBeenCalledWith(
        res,
        { id: "p-1" },
        201,
        expect.any(String),
      );
    });
  });

  describe("createCustomProgram", () => {
    expectAuthGuard(ProgramController.createCustomProgram);

    it("spreads body and adds userId", async () => {
      const body = { name: "Custom", daysPerWeek: 3 };
      mockProgramService.createCustomProgram.mockResolvedValue({ id: "p-1" });

      await ProgramController.createCustomProgram(
        asReqFor(
          ProgramController.createCustomProgram,
          mockReq({ body } as Partial<Request>),
        ),
        res,
      );

      expect(mockProgramService.createCustomProgram).toHaveBeenCalledWith({
        userId: "u-1",
        ...body,
      });
    });
  });

  describe("updateProgram", () => {
    expectAuthGuard(ProgramController.updateProgram);

    it("passes programId, userId, and body to service", async () => {
      mockProgramService.updateProgram.mockResolvedValue({ id: "p-1" });

      await ProgramController.updateProgram(
        asReqFor(
          ProgramController.updateProgram,
          mockReq({
            params: { id: "p-1" } as never,
            body: { name: "Updated" },
          } as Partial<Request>),
        ),
        res,
      );

      expect(mockProgramService.updateProgram).toHaveBeenCalledWith({
        programId: "p-1",
        userId: "u-1",
        name: "Updated",
      });
    });
  });

  describe("deleteProgram", () => {
    expectAuthGuard(ProgramController.deleteProgram);

    it("passes programId and userId to service and sends 204", async () => {
      mockProgramService.deleteProgram.mockResolvedValue(undefined);

      await ProgramController.deleteProgram(
        asReqFor(
          ProgramController.deleteProgram,
          mockReq({ params: { id: "p-1" } as never }),
        ),
        res,
      );

      expect(mockProgramService.deleteProgram).toHaveBeenCalledWith({
        programId: "p-1",
        userId: "u-1",
      });
      expect(mockSendSuccess).toHaveBeenCalledWith(res, null, 204);
    });
  });

  describe("addProgramWorkout", () => {
    expectAuthGuard(ProgramController.addProgramWorkout);

    it("passes correct DTO to service", async () => {
      mockProgramService.addProgramWorkout.mockResolvedValue({ id: "w-1" });

      await ProgramController.addProgramWorkout(
        asReqFor(
          ProgramController.addProgramWorkout,
          mockReq({
            params: { id: "p-1" } as never,
            body: { name: "Push", dayNumber: 1 },
          } as Partial<Request>),
        ),
        res,
      );

      expect(mockProgramService.addProgramWorkout).toHaveBeenCalledWith({
        programId: "p-1",
        userId: "u-1",
        name: "Push",
        dayNumber: 1,
      });
      expect(mockSendSuccess).toHaveBeenCalledWith(
        res,
        { id: "w-1" },
        201,
        expect.any(String),
      );
    });
  });

  describe("updateProgramWorkout", () => {
    expectAuthGuard(ProgramController.updateProgramWorkout);

    it("passes correct DTO to service", async () => {
      mockProgramService.updateProgramWorkout.mockResolvedValue({ id: "w-1" });

      await ProgramController.updateProgramWorkout(
        asReqFor(
          ProgramController.updateProgramWorkout,
          mockReq({
            params: { id: "p-1", workoutId: "w-1" } as never,
            body: { name: "Pull", dayNumber: 2 },
          } as Partial<Request>),
        ),
        res,
      );

      expect(mockProgramService.updateProgramWorkout).toHaveBeenCalledWith({
        programId: "p-1",
        workoutId: "w-1",
        userId: "u-1",
        name: "Pull",
        dayNumber: 2,
      });
    });
  });

  describe("deleteProgramWorkout", () => {
    expectAuthGuard(ProgramController.deleteProgramWorkout);

    it("passes correct DTO to service", async () => {
      mockProgramService.deleteProgramWorkout.mockResolvedValue(undefined);

      await ProgramController.deleteProgramWorkout(
        asReqFor(
          ProgramController.deleteProgramWorkout,
          mockReq({
            params: { id: "p-1", workoutId: "w-1" } as never,
          }),
        ),
        res,
      );

      expect(mockProgramService.deleteProgramWorkout).toHaveBeenCalledWith({
        programId: "p-1",
        workoutId: "w-1",
        userId: "u-1",
      });
      expect(mockSendSuccess).toHaveBeenCalledWith(res, null, 204);
    });
  });

  describe("addWorkoutExercise", () => {
    expectAuthGuard(ProgramController.addWorkoutExercise);

    it("passes all body fields and route params to service", async () => {
      mockProgramService.addWorkoutExercise.mockResolvedValue({ id: "we-1" });

      await ProgramController.addWorkoutExercise(
        asReqFor(
          ProgramController.addWorkoutExercise,
          mockReq({
            params: { id: "p-1", workoutId: "w-1" } as never,
            body: {
              exerciseId: "ex-1",
              order: 1,
              targetSets: 3,
              targetWeight: 100,
            },
          } as Partial<Request>),
        ),
        res,
      );

      expect(mockProgramService.addWorkoutExercise).toHaveBeenCalledWith({
        programId: "p-1",
        workoutId: "w-1",
        userId: "u-1",
        exerciseId: "ex-1",
        order: 1,
        targetSets: 3,
        targetWeight: 100,
        targetTotalReps: undefined,
        targetTopSetReps: undefined,
        targetRir: undefined,
      });
    });
  });

  describe("updateWorkoutExercise", () => {
    expectAuthGuard(ProgramController.updateWorkoutExercise);

    it("passes correct DTO to service", async () => {
      mockProgramService.updateWorkoutExercise.mockResolvedValue({
        id: "we-1",
      });

      await ProgramController.updateWorkoutExercise(
        asReqFor(
          ProgramController.updateWorkoutExercise,
          mockReq({
            params: {
              id: "p-1",
              workoutId: "w-1",
              exerciseId: "we-1",
            } as never,
            body: { targetSets: 5 },
          } as Partial<Request>),
        ),
        res,
      );

      expect(mockProgramService.updateWorkoutExercise).toHaveBeenCalledWith({
        programId: "p-1",
        workoutId: "w-1",
        workoutExerciseId: "we-1",
        userId: "u-1",
        targetSets: 5,
      });
    });
  });

  describe("deleteWorkoutExercise", () => {
    expectAuthGuard(ProgramController.deleteWorkoutExercise);

    it("passes correct DTO to service and sends 204", async () => {
      mockProgramService.deleteWorkoutExercise.mockResolvedValue(undefined);

      await ProgramController.deleteWorkoutExercise(
        asReqFor(
          ProgramController.deleteWorkoutExercise,
          mockReq({
            params: {
              id: "p-1",
              workoutId: "w-1",
              exerciseId: "we-1",
            } as never,
          }),
        ),
        res,
      );

      expect(mockProgramService.deleteWorkoutExercise).toHaveBeenCalledWith({
        programId: "p-1",
        workoutId: "w-1",
        workoutExerciseId: "we-1",
        userId: "u-1",
      });
      expect(mockSendSuccess).toHaveBeenCalledWith(res, null, 204);
    });
  });

  describe("bulkReorderWorkoutExercises", () => {
    expectAuthGuard(ProgramController.bulkReorderWorkoutExercises);

    it("passes correct DTO to service", async () => {
      mockProgramService.bulkReorderWorkoutExercises.mockResolvedValue([]);

      const exercises = [
        { id: "we-1", order: 2 },
        { id: "we-2", order: 1 },
      ];
      await ProgramController.bulkReorderWorkoutExercises(
        asReqFor(
          ProgramController.bulkReorderWorkoutExercises,
          mockReq({
            params: { id: "p-1", workoutId: "w-1" } as never,
            body: { exercises },
          } as Partial<Request>),
        ),
        res,
      );

      expect(
        mockProgramService.bulkReorderWorkoutExercises,
      ).toHaveBeenCalledWith({
        programId: "p-1",
        workoutId: "w-1",
        userId: "u-1",
        exercises,
      });
    });
  });
});
