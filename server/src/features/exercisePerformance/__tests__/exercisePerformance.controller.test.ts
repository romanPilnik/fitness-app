import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthenticationError } from "@/errors/index.js";

const mockGetExercisePerformanceSummary = vi.hoisted(() => vi.fn());
vi.mock("../exercisePerformance.service.js", () => ({
  getExercisePerformanceSummary: mockGetExercisePerformanceSummary,
}));

const mockSendSuccess = vi.hoisted(() => vi.fn());
vi.mock("@/utils/response.js", () => ({ sendSuccess: mockSendSuccess }));

import { ExercisePerformanceController } from "../exercisePerformance.controller.js";

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

describe("ExercisePerformanceController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getExercisePerformance", () => {
    expectAuthGuard(ExercisePerformanceController.getExercisePerformance);

    it("passes exerciseId and userId to service and sends success", async () => {
      const summary = {
        exerciseId: "ex-1",
        exercise: {
          id: "ex-1",
          name: "Bench",
          primaryMuscle: "chest" as const,
          equipment: "barbell" as const,
        },
        lastPerformed: null,
        personalRecord: null,
        recentHistory: [],
      };
      mockGetExercisePerformanceSummary.mockResolvedValue(summary);

      await ExercisePerformanceController.getExercisePerformance(
        asReqFor(
          ExercisePerformanceController.getExercisePerformance,
          mockReq({ params: { exerciseId: "ex-1" } as never }),
        ),
        res,
      );

      expect(mockGetExercisePerformanceSummary).toHaveBeenCalledWith({
        userId: "u-1",
        exerciseId: "ex-1",
      });
      expect(mockSendSuccess).toHaveBeenCalledWith(
        res,
        summary,
        200,
        "Exercise performance retrieved",
      );
    });
  });
});
