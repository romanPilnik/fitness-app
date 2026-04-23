import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ERROR_CODES } from "@/types/error.types.js";

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
}));
vi.mock("@/lib/prisma.js", () => ({ prisma: prismaMock }));

import { UserService } from "../user.service.js";

const fakeUser = {
  id: "u-1",
  email: "ada@example.com",
  name: "Ada",
  role: "user",
  isActive: true,
  emailVerified: false,
  image: null as string | null,
  units: "metric",
  weekStartsOn: "sunday",
  aiConfig: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("UserService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateUser", () => {
    it("updates and returns user", async () => {
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
      expect(result.name).toBe("Bea");
    });

    it("rejects when prisma update finds no record (P2025)", async () => {
      const prismaError = new PrismaClientKnownRequestError("Record to update not found.", {
        code: "P2025",
        clientVersion: "0.0.0",
      });
      prismaMock.user.update.mockRejectedValue(prismaError);

      await expect(
        UserService.updateUser({ id: "missing-id", name: "Bea" }),
      ).rejects.toBe(prismaError);
    });
  });

  describe("getNormalizedAiPreferencesForUser", () => {
    it("throws NotFoundError when user missing", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(UserService.getNormalizedAiPreferencesForUser("nope")).rejects.toMatchObject({
        name: "NotFoundError",
        code: ERROR_CODES.USER_NOT_FOUND,
      });
    });
  });
});
