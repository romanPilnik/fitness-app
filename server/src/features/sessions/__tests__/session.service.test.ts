import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/errors/index.js";
import { ERROR_CODES } from "@/types/error.types.js";

const prismaMock = vi.hoisted(() => ({
  session: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
  program: {
    findUnique: vi.fn(),
  },
}));
vi.mock("@/lib/prisma.js", () => ({ prisma: prismaMock }));

import { SessionService } from "../session.service.js";

const fakeSession = {
  id: "s-1",
  userId: "u-1",
  programId: "p-1",
  workoutName: "Push",
  dayNumber: 1,
  datePerformed: new Date(),
  sessionStatus: "completed",
  sessionDuration: 60,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("SessionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSessions", () => {
    it("returns paginated sessions for user", async () => {
      prismaMock.session.findMany.mockResolvedValue([fakeSession]);

      const result = await SessionService.getSessions({
        userId: "u-1",
        limit: 20,
      });

      expect(prismaMock.session.findMany).toHaveBeenCalled();
      const sessionFindCall = prismaMock.session.findMany.mock.calls[0];
      if (sessionFindCall === undefined) {
        throw new Error("expected session.findMany mock call");
      }
      const findArgs = sessionFindCall[0] as {
        where: { userId: string };
        include: { program: { select: { id: boolean; name: boolean } } };
      };
      expect(findArgs.where.userId).toBe("u-1");
      expect(findArgs.include.program.select).toEqual({ id: true, name: true });
      expect(result.data).toHaveLength(1);
      expect(result.hasMore).toBe(false);
    });

    it("filters by sessionStatus when provided", async () => {
      prismaMock.session.findMany.mockResolvedValue([]);

      await SessionService.getSessions({
        userId: "u-1",
        sessionStatus: "completed" as never,
        limit: 20,
      });

      expect(prismaMock.session.findMany).toHaveBeenCalled();
      const statusCall = prismaMock.session.findMany.mock.calls[0];
      if (statusCall === undefined) {
        throw new Error("expected session.findMany mock call");
      }
      const filterArgs = statusCall[0] as {
        where: { sessionStatus: string };
      };
      expect(filterArgs.where.sessionStatus).toBe("completed");
    });

    it("filters by programId when provided", async () => {
      prismaMock.session.findMany.mockResolvedValue([]);

      await SessionService.getSessions({
        userId: "u-1",
        programId: "p-99",
        limit: 20,
      });

      const call = prismaMock.session.findMany.mock.calls[0];
      if (call === undefined) {
        throw new Error("expected session.findMany mock call");
      }
      const filterArgs = call[0] as { where: { programId: string } };
      expect(filterArgs.where.programId).toBe("p-99");
    });

    it("filters by dateFrom and dateTo when provided", async () => {
      prismaMock.session.findMany.mockResolvedValue([]);
      const from = "2025-01-01T00:00:00.000Z";
      const to = "2025-01-31T23:59:59.999Z";

      await SessionService.getSessions({
        userId: "u-1",
        dateFrom: from,
        dateTo: to,
        limit: 20,
      });

      const call = prismaMock.session.findMany.mock.calls[0];
      if (call === undefined) {
        throw new Error("expected session.findMany mock call");
      }
      const filterArgs = call[0] as {
        where: { datePerformed: { gte: Date; lte: Date } };
      };
      expect(filterArgs.where.datePerformed.gte).toEqual(new Date(from));
      expect(filterArgs.where.datePerformed.lte).toEqual(new Date(to));
    });
  });

  describe("getSessionById", () => {
    it("returns session with includes when found", async () => {
      prismaMock.session.findUnique.mockResolvedValue(fakeSession);

      const result = await SessionService.getSessionById({
        sessionId: "s-1",
        userId: "u-1",
      });

      expect(prismaMock.session.findUnique).toHaveBeenCalled();
      const uniqueCall = prismaMock.session.findUnique.mock.calls[0];
      if (uniqueCall === undefined) {
        throw new Error("expected session.findUnique mock call");
      }
      const uniqueArgs = uniqueCall[0] as {
        where: { id: string; userId: string };
        include: { program: boolean; sessionExercises: unknown };
      };
      expect(uniqueArgs.where).toEqual({ id: "s-1", userId: "u-1" });
      expect(uniqueArgs.include.program).toBe(true);
      expect(uniqueArgs.include.sessionExercises).toBeDefined();
      expect(result).toEqual(fakeSession);
    });

    it("throws NotFoundError when session does not exist", async () => {
      prismaMock.session.findUnique.mockResolvedValue(null);

      await expect(
        SessionService.getSessionById({ sessionId: "nope", userId: "u-1" }),
      ).rejects.toThrow(NotFoundError);

      await expect(
        SessionService.getSessionById({ sessionId: "nope", userId: "u-1" }),
      ).rejects.toMatchObject({ code: ERROR_CODES.SESSION_NOT_FOUND });
    });
  });

  describe("createSession", () => {
    it("creates session with nested exercises and sets", async () => {
      prismaMock.program.findUnique.mockResolvedValue({ userId: "u-1" });
      prismaMock.session.create.mockResolvedValue(fakeSession);

      const result = await SessionService.createSession({
        userId: "u-1",
        programId: "p-1",
        workoutName: "Push",
        dayNumber: 1,
        sessionStatus: "completed" as never,
        sessionDuration: 60,
        exercises: [
          {
            exerciseId: "ex-1",
            order: 1,
            targetSets: 3,
            sets: [{ reps: 10, weight: 100, rir: 2, setCompleted: true }],
          },
        ],
      });

      expect(prismaMock.program.findUnique).toHaveBeenCalledWith({
        where: { id: "p-1" },
        select: { userId: true },
      });
      expect(prismaMock.session.create).toHaveBeenCalled();
      const sessionCreateCall = prismaMock.session.create.mock.calls[0];
      if (sessionCreateCall === undefined) {
        throw new Error("expected session.create mock call");
      }
      const createArgs = sessionCreateCall[0] as {
        data: {
          userId: string;
          programId: string;
          sessionExercises: { create: unknown };
        };
      };
      expect(createArgs.data.userId).toBe("u-1");
      expect(createArgs.data.programId).toBe("p-1");
      expect(Array.isArray(createArgs.data.sessionExercises.create)).toBe(true);
      expect(result).toEqual(fakeSession);
    });

    it("throws NotFoundError when program does not belong to user", async () => {
      prismaMock.program.findUnique.mockResolvedValue({ userId: "other" });

      await expect(
        SessionService.createSession({
          userId: "u-1",
          programId: "p-1",
          workoutName: "Push",
          dayNumber: 1,
          sessionStatus: "completed" as never,
          sessionDuration: 60,
          exercises: [],
        }),
      ).rejects.toThrow(NotFoundError);

      await expect(
        SessionService.createSession({
          userId: "u-1",
          programId: "p-1",
          workoutName: "Push",
          dayNumber: 1,
          sessionStatus: "completed" as never,
          sessionDuration: 60,
          exercises: [],
        }),
      ).rejects.toMatchObject({ code: ERROR_CODES.PROGRAM_NOT_FOUND });
    });

    it("throws NotFoundError when program does not exist", async () => {
      prismaMock.program.findUnique.mockResolvedValue(null);

      await expect(
        SessionService.createSession({
          userId: "u-1",
          programId: "nope",
          workoutName: "Push",
          dayNumber: 1,
          sessionStatus: "completed" as never,
          sessionDuration: 60,
          exercises: [],
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteSession", () => {
    it("deletes session when user owns it", async () => {
      prismaMock.session.findUnique.mockResolvedValue(fakeSession);
      prismaMock.session.delete.mockResolvedValue(undefined);

      await SessionService.deleteSession({ sessionId: "s-1", userId: "u-1" });

      expect(prismaMock.session.delete).toHaveBeenCalledWith({
        where: { id: "s-1" },
      });
    });

    it("throws NotFoundError when session does not exist", async () => {
      prismaMock.session.findUnique.mockResolvedValue(null);

      await expect(
        SessionService.deleteSession({ sessionId: "nope", userId: "u-1" }),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws NotFoundError when session does not belong to user", async () => {
      prismaMock.session.findUnique.mockResolvedValue({
        ...fakeSession,
        userId: "other",
      });

      await expect(
        SessionService.deleteSession({ sessionId: "s-1", userId: "u-1" }),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
