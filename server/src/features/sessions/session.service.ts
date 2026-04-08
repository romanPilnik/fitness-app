import { NotFoundError } from "@/errors/index";
import { ERROR_CODES } from "@/types/error.types";
import type { SessionModel } from "@/generated/prisma/models";
import type { Prisma } from "@/generated/prisma/client";
import type {
  GetSessionsDTO,
  GetSessionByIdDTO,
  CreateSessionDTO,
  DeleteSessionDTO,
} from "./session.dtos.js";
import { prisma } from "@/lib/prisma";
import {
  buildCursorArgs,
  paginateCursorResult,
  type CursorPage,
} from "@/lib/pagination.js";

const sessionListInclude = {
  program: { select: { id: true, name: true } },
} as const;

export type SessionListItem = Prisma.SessionGetPayload<{
  include: typeof sessionListInclude;
}>;

async function getSessions(
  input: GetSessionsDTO,
): Promise<CursorPage<SessionListItem>> {
  const {
    userId,
    sessionStatus,
    programId,
    dateFrom,
    dateTo,
    cursor,
    limit,
  } = input;

  const where: Prisma.SessionWhereInput = { userId };
  if (sessionStatus !== undefined) {
    where.sessionStatus = sessionStatus;
  }
  if (programId !== undefined) {
    where.programId = programId;
  }
  if (dateFrom !== undefined || dateTo !== undefined) {
    where.datePerformed = {};
    if (dateFrom !== undefined) {
      where.datePerformed.gte = new Date(dateFrom);
    }
    if (dateTo !== undefined) {
      where.datePerformed.lte = new Date(dateTo);
    }
  }

  const items = await prisma.session.findMany({
    where,
    include: sessionListInclude,
    orderBy: { datePerformed: "desc" },
    ...buildCursorArgs({ cursor, limit }),
  });
  return paginateCursorResult(items, limit);
}

async function getSessionById(input: GetSessionByIdDTO): Promise<SessionModel> {
  const { sessionId, userId } = input;

  const session = await prisma.session.findUnique({
    where: { id: sessionId, userId },
    include: {
      program: true,
      sessionExercises: {
        orderBy: { order: "asc" },
        include: { exercise: true, sessionExerciseSets: true },
      },
    },
  });
  if (!session) {
    throw new NotFoundError("Session not found", ERROR_CODES.SESSION_NOT_FOUND);
  }

  return session;
}

async function createSession(input: CreateSessionDTO): Promise<SessionModel> {
  const {
    userId,
    programId,
    workoutName,
    dayNumber,
    sessionStatus,
    exercises,
    sessionDuration,
  } = input;

  // Prevent logging sessions against programs that don't belong to the user.
  const program = await prisma.program.findUnique({
    where: { id: programId },
    select: { userId: true },
  });
  if (program?.userId !== userId) {
    throw new NotFoundError("Program not found", ERROR_CODES.PROGRAM_NOT_FOUND);
  }

  const session = await prisma.session.create({
    data: {
      userId,
      programId,
      workoutName,
      dayNumber,
      sessionStatus,
      sessionDuration,
      datePerformed: new Date(),
      sessionExercises: {
        create: exercises.map((exercise) => ({
          exerciseId: exercise.exerciseId,
          userId,

          order: exercise.order,
          targetSets: exercise.targetSets,
          targetWeight: exercise.targetWeight,
          targetTotalReps: exercise.targetTotalReps,
          targetTopSetReps: exercise.targetTopSetReps,
          targetRir: exercise.targetRir,

          sessionExerciseSets: {
            create: exercise.sets.map((set) => ({
              userId,
              targetWeight: set.targetWeight,
              targetReps: set.targetReps,
              reps: set.reps,
              weight: set.weight,
              rir: set.rir,
              setCompleted: set.setCompleted,
            })),
          },
        })),
      },
    },
    include: {
      sessionExercises: {
        include: { exercise: true, sessionExerciseSets: true },
      },
    },
  });
  return session;
}

async function deleteSession(input: DeleteSessionDTO): Promise<void> {
  const { sessionId, userId } = input;

  const session = await prisma.session.findUnique({
    where: { id: sessionId, userId },
  });
  if (session?.userId !== userId) {
    throw new NotFoundError("Session not found", ERROR_CODES.SESSION_NOT_FOUND);
  }

  await prisma.session.delete({ where: { id: sessionId } });
}

export const SessionService = {
  getSessions,
  getSessionById,
  createSession,
  deleteSession,
};
