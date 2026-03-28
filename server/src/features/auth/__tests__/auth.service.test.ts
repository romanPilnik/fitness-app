import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError, AuthenticationError } from "@/errors/index.js";
import { ERROR_CODES } from "@/types/error.types.js";

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
}));
vi.mock("@/lib/prisma.js", () => ({ prisma: prismaMock }));

const bcryptMock = vi.hoisted(() => ({
  default: { hash: vi.fn(), compare: vi.fn() },
}));
vi.mock("bcryptjs", () => bcryptMock);

import { AuthService } from "../auth.service.js";

const fakeUser = {
  id: "user-1",
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

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("creates a new user and returns it without password", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      bcryptMock.default.hash.mockResolvedValue("hashed-pw");
      prismaMock.user.create.mockResolvedValue({ ...fakeUser });

      const result = await AuthService.register({
        email: "ada@example.com",
        password: "plaintext",
        name: "Ada",
      });

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: "ada@example.com" },
      });
      expect(bcryptMock.default.hash).toHaveBeenCalledWith("plaintext", 10);
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: { email: "ada@example.com", password: "hashed-pw", name: "Ada" },
      });
      expect(result).not.toHaveProperty("password");
      expect(result.id).toBe("user-1");
    });

    it("throws ConflictError when email already exists", async () => {
      prismaMock.user.findUnique.mockResolvedValue(fakeUser);

      await expect(
        AuthService.register({
          email: "ada@example.com",
          password: "pw",
          name: "Ada",
        }),
      ).rejects.toThrow(ConflictError);

      await expect(
        AuthService.register({
          email: "ada@example.com",
          password: "pw",
          name: "Ada",
        }),
      ).rejects.toMatchObject({ code: ERROR_CODES.EMAIL_TAKEN });
    });
  });

  describe("login", () => {
    it("returns user without password on valid credentials", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ ...fakeUser });
      bcryptMock.default.compare.mockResolvedValue(true);

      const result = await AuthService.login({
        email: "ada@example.com",
        password: "plaintext",
      });

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: "ada@example.com" },
      });
      expect(bcryptMock.default.compare).toHaveBeenCalledWith(
        "plaintext",
        "hashed-pw",
      );
      expect(result).not.toHaveProperty("password");
      expect(result.email).toBe("ada@example.com");
    });

    it("throws AuthenticationError when user is not found", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        AuthService.login({ email: "no@one.com", password: "pw" }),
      ).rejects.toThrow(AuthenticationError);

      await expect(
        AuthService.login({ email: "no@one.com", password: "pw" }),
      ).rejects.toMatchObject({ code: ERROR_CODES.INVALID_CREDENTIALS });
    });

    it("throws AuthenticationError when password does not match", async () => {
      prismaMock.user.findUnique.mockResolvedValue({ ...fakeUser });
      bcryptMock.default.compare.mockResolvedValue(false);

      await expect(
        AuthService.login({ email: "ada@example.com", password: "wrong" }),
      ).rejects.toThrow(AuthenticationError);
    });
  });
});
