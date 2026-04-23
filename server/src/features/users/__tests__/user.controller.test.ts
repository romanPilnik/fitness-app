import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthenticationError } from "@/errors/index.js";

const mockUserService = vi.hoisted(() => ({
  updateUser: vi.fn(),
  getNormalizedAiPreferencesForUser: vi.fn(),
  patchAiPreferences: vi.fn(),
}));
vi.mock("../user.service.js", () => ({ UserService: mockUserService }));

const mockSendSuccess = vi.hoisted(() => vi.fn());
vi.mock("@/utils/response.js", () => ({ sendSuccess: mockSendSuccess }));

const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
  },
}));
vi.mock("@/lib/prisma.js", () => ({ prisma: mockPrisma }));

import { UserController } from "../user.controller.js";

function asReqFor<M extends (req: never, res: Response) => unknown>(
  _method: M,
  req: Request,
): Parameters<M>[0] {
  return req as Parameters<M>[0];
}

const fakeRequestUser = {
  id: "u-1",
  email: "ada@example.com",
  name: "Ada",
  role: "user" as const,
  isActive: true,
  units: "metric" as const,
  weekStartsOn: "sunday" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    user: fakeRequestUser,
    body: {},
    ...overrides,
  } as unknown as Request;
}
const res = {} as Response;

describe("UserController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCurrentUser", () => {
    it("sends DB user with 200", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(fakeRequestUser);

      await UserController.getCurrentUser(mockReq(), res);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: fakeRequestUser.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          units: true,
          weekStartsOn: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(mockSendSuccess).toHaveBeenCalledWith(
        res,
        fakeRequestUser,
        200,
        "User retrieved",
      );
    });

    it("throws AuthenticationError when req.user is missing", async () => {
      await expect(
        UserController.getCurrentUser(
          mockReq({ user: undefined } as Partial<Request>),
          res,
        ),
      ).rejects.toThrow(AuthenticationError);
    });
  });

  describe("updateCurrentUser", () => {
    it("calls UserService.updateUser and sends 200", async () => {
      const updated = { ...fakeRequestUser, name: "Bea" };
      mockUserService.updateUser.mockResolvedValue(updated);

      await UserController.updateCurrentUser(
        asReqFor(
          UserController.updateCurrentUser,
          mockReq({ body: { name: "Bea" } } as Partial<Request>),
        ),
        res,
      );

      expect(mockUserService.updateUser).toHaveBeenCalledWith({
        id: "u-1",
        name: "Bea",
        units: undefined,
        weekStartsOn: undefined,
      });
      expect(mockSendSuccess).toHaveBeenCalledWith(
        res,
        updated,
        200,
        "User updated",
      );
    });

    it("throws AuthenticationError when req.user is missing", async () => {
      await expect(
        UserController.updateCurrentUser(
          asReqFor(
            UserController.updateCurrentUser,
            mockReq({ user: undefined } as Partial<Request>),
          ),
          res,
        ),
      ).rejects.toThrow(AuthenticationError);
    });
  });

  describe("getAiPreferences", () => {
    it("calls UserService.getNormalizedAiPreferencesForUser and sends 200", async () => {
      const prefs = {
        progressionStyle: "moderate" as const,
        progressionPreference: "balanced" as const,
        deloadSensitivity: "medium" as const,
        rirFloor: 2,
      };
      mockUserService.getNormalizedAiPreferencesForUser.mockResolvedValue(prefs);

      await UserController.getAiPreferences(mockReq(), res);

      expect(mockUserService.getNormalizedAiPreferencesForUser).toHaveBeenCalledWith("u-1");
      expect(mockSendSuccess).toHaveBeenCalledWith(
        res,
        prefs,
        200,
        "AI preferences retrieved",
      );
    });

    it("throws AuthenticationError when req.user is missing", async () => {
      await expect(
        UserController.getAiPreferences(mockReq({ user: undefined } as Partial<Request>), res),
      ).rejects.toThrow(AuthenticationError);
    });
  });

  describe("patchAiPreferences", () => {
    it("calls UserService.patchAiPreferences and sends 200", async () => {
      const prefs = {
        progressionStyle: "aggressive" as const,
        progressionPreference: "balanced" as const,
        deloadSensitivity: "medium" as const,
        rirFloor: 2,
      };
      mockUserService.patchAiPreferences.mockResolvedValue(prefs);

      await UserController.patchAiPreferences(
        asReqFor(
          UserController.patchAiPreferences,
          mockReq({ body: { progressionStyle: "aggressive" } } as Partial<Request>),
        ),
        res,
      );

      expect(mockUserService.patchAiPreferences).toHaveBeenCalledWith({
        id: "u-1",
        patch: { progressionStyle: "aggressive" },
      });
      expect(mockSendSuccess).toHaveBeenCalledWith(
        res,
        prefs,
        200,
        "AI preferences updated",
      );
    });

    it("throws AuthenticationError when req.user is missing", async () => {
      await expect(
        UserController.patchAiPreferences(
          asReqFor(
            UserController.patchAiPreferences,
            mockReq({
              user: undefined,
              body: { rirFloor: 1 },
            } as Partial<Request>),
          ),
          res,
        ),
      ).rejects.toThrow(AuthenticationError);
    });
  });
});
