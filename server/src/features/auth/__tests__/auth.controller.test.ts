import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAuthService = vi.hoisted(() => ({
  register: vi.fn(),
  login: vi.fn(),
}));
vi.mock("../auth.service.js", () => ({ AuthService: mockAuthService }));

const mockGenerateAuthToken = vi.hoisted(() => vi.fn());
vi.mock("../auth.helpers.js", () => ({ default: mockGenerateAuthToken }));

const mockSendSuccess = vi.hoisted(() => vi.fn());
vi.mock("@/utils/response.js", () => ({ sendSuccess: mockSendSuccess }));

import { AuthController } from "../auth.controller.js";

const fakeUser = { id: "u-1", email: "ada@example.com", name: "Ada" };

function mockReq(body: Record<string, unknown> = {}): Request {
  return { body } as unknown as Request;
}

function asReqFor<M extends (req: never, res: Response) => unknown>(
  _method: M,
  req: Request,
): Parameters<M>[0] {
  return req as Parameters<M>[0];
}
const res = {} as Response;

describe("AuthController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerUser", () => {
    it("calls AuthService.register, generates token, and sends 201", async () => {
      mockAuthService.register.mockResolvedValue(fakeUser);
      mockGenerateAuthToken.mockReturnValue("jwt-token");

      await AuthController.registerUser(
        asReqFor(
          AuthController.registerUser,
          mockReq({ email: "ada@example.com", password: "pw", name: "Ada" }),
        ),
        res,
      );

      expect(mockAuthService.register).toHaveBeenCalledWith({
        email: "ada@example.com",
        password: "pw",
        name: "Ada",
      });
      expect(mockGenerateAuthToken).toHaveBeenCalledWith("u-1");
      expect(mockSendSuccess).toHaveBeenCalledWith(
        res,
        {
          token: "jwt-token",
          user: { id: "u-1", email: "ada@example.com", name: "Ada" },
        },
        201,
        "User created successfully",
      );
    });
  });

  describe("loginUser", () => {
    it("calls AuthService.login, generates token, and sends 200", async () => {
      mockAuthService.login.mockResolvedValue(fakeUser);
      mockGenerateAuthToken.mockReturnValue("jwt-token");

      await AuthController.loginUser(
        asReqFor(
          AuthController.loginUser,
          mockReq({ email: "ada@example.com", password: "pw" }),
        ),
        res,
      );

      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: "ada@example.com",
        password: "pw",
      });
      expect(mockGenerateAuthToken).toHaveBeenCalledWith("u-1");
      expect(mockSendSuccess).toHaveBeenCalledWith(
        res,
        {
          token: "jwt-token",
          user: { id: "u-1", email: "ada@example.com", name: "Ada" },
        },
        200,
        "User logged in successfully",
      );
    });
  });
});
