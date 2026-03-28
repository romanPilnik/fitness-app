import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  NotFoundError,
  AuthenticationError,
  BadRequestError,
} from "@/errors/index.js";
import { ERROR_CODES } from "@/types/error.types.js";

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
}));
vi.mock("@/lib/prisma.js", () => ({ prisma: prismaMock }));

const bcryptMock = vi.hoisted(() => ({
  default: { hash: vi.fn(), compare: vi.fn() },
}));
vi.mock("bcryptjs", () => bcryptMock);

import { UserService } from "../user.service.js";

const fakeUser = {
  id: "u-1",
  email: "ada@example.com",
  name: "Ada",
  password: "hashed-pw",
  role: "user",
  isActive: true,
  units: "metric",
  weekStartsOn: "sunday",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("UserService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("changePassword", () => {
    it("hashes and updates the password on valid input", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ ...fakeUser });
      bcryptMock.default.compare.mockResolvedValue(true);
      bcryptMock.default.hash.mockResolvedValue("new-hashed");
      prismaMock.user.update.mockResolvedValue(undefined);

      await UserService.changePassword({
        id: "u-1",
        oldPassword: "old-plain",
        newPassword: "new-plain",
      });

      expect(bcryptMock.default.compare).toHaveBeenCalledWith(
        "old-plain",
        "hashed-pw",
      );
      expect(bcryptMock.default.hash).toHaveBeenCalledWith("new-plain", 10);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: "u-1" },
        data: { password: "new-hashed" },
      });
    });

    it("throws NotFoundError when user does not exist", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        UserService.changePassword({
          id: "nope",
          oldPassword: "x",
          newPassword: "y",
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws AuthenticationError when old password is wrong", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ ...fakeUser });
      bcryptMock.default.compare.mockResolvedValue(false);

      await expect(
        UserService.changePassword({
          id: "u-1",
          oldPassword: "wrong",
          newPassword: "y",
        }),
      ).rejects.toThrow(AuthenticationError);

      await expect(
        UserService.changePassword({
          id: "u-1",
          oldPassword: "wrong",
          newPassword: "y",
        }),
      ).rejects.toMatchObject({ code: ERROR_CODES.PASSWORD_MISMATCH });
    });

    it("throws BadRequestError when new password equals old password", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ ...fakeUser });
      bcryptMock.default.compare.mockResolvedValue(true);

      await expect(
        UserService.changePassword({
          id: "u-1",
          oldPassword: "same",
          newPassword: "same",
        }),
      ).rejects.toThrow(BadRequestError);

      await expect(
        UserService.changePassword({
          id: "u-1",
          oldPassword: "same",
          newPassword: "same",
        }),
      ).rejects.toMatchObject({ code: ERROR_CODES.INVALID_INPUT });
    });
  });

  describe("updateUser", () => {
    it("updates and returns user without password", async () => {
      prismaMock.user.update.mockResolvedValue({ ...fakeUser, name: "Bea" });

      const result = await UserService.updateUser({
        id: "u-1",
        name: "Bea",
      });

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: "u-1" },
        data: {
          name: "Bea",
          units: undefined,
          weekStartsOn: undefined,
        },
      });
      expect(result).not.toHaveProperty("password");
      expect(result.name).toBe("Bea");
    });

    it("rejects when prisma update finds no record (P2025)", async () => {
      const prismaError = new PrismaClientKnownRequestError(
        "Record to update not found.",
        { code: "P2025", clientVersion: "0.0.0" },
      );
      prismaMock.user.update.mockRejectedValue(prismaError);

      await expect(
        UserService.updateUser({ id: "missing-id", name: "Bea" }),
      ).rejects.toBe(prismaError);
    });
  });
});
