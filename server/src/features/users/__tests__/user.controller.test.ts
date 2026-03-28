import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthenticationError } from "@/errors/index.js";

const mockUserService = vi.hoisted(() => ({
  updateUser: vi.fn(),
  changePassword: vi.fn(),
}));
vi.mock("../user.service.js", () => ({ UserService: mockUserService }));

const mockSendSuccess = vi.hoisted(() => vi.fn());
vi.mock("@/utils/response.js", () => ({ sendSuccess: mockSendSuccess }));

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
    it("sends req.user with 200", () => {
      UserController.getCurrentUser(mockReq(), res);

      expect(mockSendSuccess).toHaveBeenCalledWith(
        res,
        fakeRequestUser,
        200,
        "User retrieved",
      );
    });

    it("sends undefined when req.user is missing (no auth middleware)", () => {
      UserController.getCurrentUser(
        mockReq({ user: undefined } as Partial<Request>),
        res,
      );

      expect(mockSendSuccess).toHaveBeenCalledWith(
        res,
        undefined,
        200,
        "User retrieved",
      );
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

  describe("changePassword", () => {
    it("calls UserService.changePassword and sends 200", async () => {
      mockUserService.changePassword.mockResolvedValue(undefined);

      await UserController.changePassword(
        asReqFor(
          UserController.changePassword,
          mockReq({
            body: { oldPassword: "old", newPassword: "new" },
          } as Partial<Request>),
        ),
        res,
      );

      expect(mockUserService.changePassword).toHaveBeenCalledWith({
        id: "u-1",
        oldPassword: "old",
        newPassword: "new",
      });
      expect(mockSendSuccess).toHaveBeenCalledWith(
        res,
        null,
        200,
        "Password changed successfully",
      );
    });

    it("throws AuthenticationError when req.user is missing", async () => {
      await expect(
        UserController.changePassword(
          asReqFor(
            UserController.changePassword,
            mockReq({ user: undefined } as Partial<Request>),
          ),
          res,
        ),
      ).rejects.toThrow(AuthenticationError);
    });
  });
});
