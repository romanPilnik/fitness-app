import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthenticationError } from "@/errors/index.js";

const mockExerciseService = vi.hoisted(() => ({
  getExercises: vi.fn(),
  getExerciseById: vi.fn(),
  createExercise: vi.fn(),
  updateExercise: vi.fn(),
  deleteExercise: vi.fn(),
}));
vi.mock("../exercise.service.js", () => ({
  ExerciseService: mockExerciseService,
}));

const mockSendSuccess = vi.hoisted(() => vi.fn());
vi.mock("@/utils/response.js", () => ({ sendSuccess: mockSendSuccess }));

import { ExerciseController } from "../exercise.controller.js";

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

const adminUser = { ...fakeUser, id: "admin-1", role: "admin" as const };

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

describe("ExerciseController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getExercises", () => {
    it("passes query and user id to service", async () => {
      const page = { data: [], nextCursor: null, hasMore: false };
      mockExerciseService.getExercises.mockResolvedValue(page);

      await ExerciseController.getExercises(
        asReqFor(
          ExerciseController.getExercises,
          mockReq({ query: { primaryMuscle: "chest" } as never }),
        ),
        res,
      );

      expect(mockExerciseService.getExercises).toHaveBeenCalledWith(
        expect.objectContaining({
          primaryMuscle: "chest",
          userId: "u-1",
        }),
      );
      expect(mockSendSuccess).toHaveBeenCalledWith(
        res,
        page,
        200,
        expect.any(String),
      );
    });

    it("passes undefined userId when req.user is missing", async () => {
      const page = { data: [], nextCursor: null, hasMore: false };
      mockExerciseService.getExercises.mockResolvedValue(page);

      await ExerciseController.getExercises(
        asReqFor(
          ExerciseController.getExercises,
          mockReq({
            user: undefined,
            query: { primaryMuscle: "back" } as never,
          } as Partial<Request>),
        ),
        res,
      );

      expect(mockExerciseService.getExercises).toHaveBeenCalledWith(
        expect.objectContaining({
          primaryMuscle: "back",
          userId: undefined,
        }),
      );
    });
  });

  describe("getExerciseById", () => {
    it("passes params.id to service", async () => {
      mockExerciseService.getExerciseById.mockResolvedValue({ id: "ex-1" });

      await ExerciseController.getExerciseById(
        asReqFor(
          ExerciseController.getExerciseById,
          mockReq({ params: { id: "ex-1" } as never }),
        ),
        res,
      );

      expect(mockExerciseService.getExerciseById).toHaveBeenCalledWith({
        id: "ex-1",
      });
    });
  });

  describe("createExercise", () => {
    it("sets createdByUserId to null for admin", async () => {
      mockExerciseService.createExercise.mockResolvedValue({ id: "ex-1" });

      await ExerciseController.createExercise(
        asReqFor(
          ExerciseController.createExercise,
          mockReq({
            user: adminUser,
            body: { name: "Bench", equipment: "barbell" },
          } as Partial<Request>),
        ),
        res,
      );

      expect(mockExerciseService.createExercise).toHaveBeenCalledWith(
        expect.objectContaining({ createdByUserId: null }),
      );
      expect(mockSendSuccess).toHaveBeenCalledWith(
        res,
        { id: "ex-1" },
        201,
        expect.any(String),
      );
    });

    it("sets createdByUserId to user.id for regular user", async () => {
      mockExerciseService.createExercise.mockResolvedValue({ id: "ex-1" });

      await ExerciseController.createExercise(
        asReqFor(
          ExerciseController.createExercise,
          mockReq({
            body: { name: "Bench" },
          } as Partial<Request>),
        ),
        res,
      );

      expect(mockExerciseService.createExercise).toHaveBeenCalledWith(
        expect.objectContaining({ createdByUserId: "u-1" }),
      );
    });

    it("throws AuthenticationError when req.user is missing", async () => {
      await expect(
        ExerciseController.createExercise(
          asReqFor(
            ExerciseController.createExercise,
            mockReq({ user: undefined } as Partial<Request>),
          ),
          res,
        ),
      ).rejects.toThrow(AuthenticationError);
    });
  });

  describe("updateExercise", () => {
    it("passes id, userId, and body to service", async () => {
      mockExerciseService.updateExercise.mockResolvedValue({ id: "ex-1" });

      await ExerciseController.updateExercise(
        asReqFor(
          ExerciseController.updateExercise,
          mockReq({
            params: { id: "ex-1" } as never,
            body: { name: "Incline" },
          } as Partial<Request>),
        ),
        res,
      );

      expect(mockExerciseService.updateExercise).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "ex-1",
          userId: "u-1",
          name: "Incline",
        }),
      );
    });

    it("throws AuthenticationError when req.user is missing", async () => {
      await expect(
        ExerciseController.updateExercise(
          asReqFor(
            ExerciseController.updateExercise,
            mockReq({ user: undefined } as Partial<Request>),
          ),
          res,
        ),
      ).rejects.toThrow(AuthenticationError);
    });
  });

  describe("deleteExercise", () => {
    it("passes id and userId to service and sends 204", async () => {
      mockExerciseService.deleteExercise.mockResolvedValue(undefined);

      await ExerciseController.deleteExercise(
        asReqFor(
          ExerciseController.deleteExercise,
          mockReq({ params: { id: "ex-1" } as never }),
        ),
        res,
      );

      expect(mockExerciseService.deleteExercise).toHaveBeenCalledWith({
        id: "ex-1",
        userId: "u-1",
      });
      expect(mockSendSuccess).toHaveBeenCalledWith(res, null, 204);
    });

    it("throws AuthenticationError when req.user is missing", async () => {
      await expect(
        ExerciseController.deleteExercise(
          asReqFor(
            ExerciseController.deleteExercise,
            mockReq({ user: undefined } as Partial<Request>),
          ),
          res,
        ),
      ).rejects.toThrow(AuthenticationError);
    });
  });
});
