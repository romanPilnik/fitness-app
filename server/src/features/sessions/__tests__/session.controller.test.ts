import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthenticationError } from "@/errors/index.js";

const mockSessionService = vi.hoisted(() => ({
  getSessions: vi.fn(),
  getSessionById: vi.fn(),
  createSession: vi.fn(),
  deleteSession: vi.fn(),
}));
vi.mock("../session.service.js", () => ({
  SessionService: mockSessionService,
}));

const mockSendSuccess = vi.hoisted(() => vi.fn());
vi.mock("@/utils/response.js", () => ({ sendSuccess: mockSendSuccess }));

import { SessionController } from "../session.controller.js";

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

describe("SessionController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSessions", () => {
    expectAuthGuard(SessionController.getSessions);

    it("passes query and userId to service", async () => {
      const page = { data: [], nextCursor: null, hasMore: false };
      mockSessionService.getSessions.mockResolvedValue(page);

      await SessionController.getSessions(
        asReqFor(
          SessionController.getSessions,
          mockReq({ query: { sessionStatus: "completed" } as never }),
        ),
        res,
      );

      expect(mockSessionService.getSessions).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionStatus: "completed",
          userId: "u-1",
        }),
      );
      expect(mockSendSuccess).toHaveBeenCalledWith(
        res,
        page,
        200,
        "Sessions retrieved",
      );
    });
  });

  describe("getSessionById", () => {
    expectAuthGuard(SessionController.getSessionById);

    it("passes sessionId and userId to service", async () => {
      mockSessionService.getSessionById.mockResolvedValue({ id: "s-1" });

      await SessionController.getSessionById(
        asReqFor(
          SessionController.getSessionById,
          mockReq({ params: { id: "s-1" } as never }),
        ),
        res,
      );

      expect(mockSessionService.getSessionById).toHaveBeenCalledWith({
        sessionId: "s-1",
        userId: "u-1",
      });
      expect(mockSendSuccess).toHaveBeenCalledWith(
        res,
        { id: "s-1" },
        200,
        "Session retrieved",
      );
    });
  });

  describe("createSession", () => {
    expectAuthGuard(SessionController.createSession);

    it("spreads body and adds userId", async () => {
      const body = {
        programId: "p-1",
        workoutName: "Push",
        dayNumber: 1,
        sessionStatus: "completed",
        sessionDuration: 60,
        exercises: [],
      };
      mockSessionService.createSession.mockResolvedValue({ id: "s-1" });

      await SessionController.createSession(
        asReqFor(
          SessionController.createSession,
          mockReq({ body } as Partial<Request>),
        ),
        res,
      );

      expect(mockSessionService.createSession).toHaveBeenCalledWith({
        userId: "u-1",
        ...body,
      });
      expect(mockSendSuccess).toHaveBeenCalledWith(
        res,
        { id: "s-1" },
        201,
        "Session logged",
      );
    });
  });

  describe("deleteSession", () => {
    expectAuthGuard(SessionController.deleteSession);

    it("passes sessionId and userId to service and sends 204", async () => {
      mockSessionService.deleteSession.mockResolvedValue(undefined);

      await SessionController.deleteSession(
        asReqFor(
          SessionController.deleteSession,
          mockReq({ params: { id: "s-1" } as never }),
        ),
        res,
      );

      expect(mockSessionService.deleteSession).toHaveBeenCalledWith({
        sessionId: "s-1",
        userId: "u-1",
      });
      expect(mockSendSuccess).toHaveBeenCalledWith(res, null, 204);
    });
  });
});
