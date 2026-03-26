import { AppError } from "../../errors/AppError";
import { ERROR_CODES } from "../../types/error.types";
import type { SessionModel } from "../../generated/prisma/models";
import type {
  GetSessionsDTO,
  GetSessionByIdDTO,
  CreateSessionDTO,
  DeleteSessionDTO,
} from "./session.dtos.js";
import { prisma } from "../../lib/prisma";
import {
  buildCursorArgs,
  paginateCursorResult,
  type CursorPage,
} from "../../lib/pagination.js";

async function getSessions(
  input: GetSessionsDTO,
): Promise<CursorPage<SessionModel>> {
  const { userId, sessionStatus, cursor, limit } = input;

  const items = await prisma.session.findMany({
    where: {
      userId,
      sessionStatus,
    },
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
    throw new AppError("Session not found", 404, ERROR_CODES.NOT_FOUND);
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
    throw new AppError("Program not found", 404, ERROR_CODES.NOT_FOUND);
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
    throw new AppError("Session not found", 404, ERROR_CODES.NOT_FOUND);
  }

  await prisma.session.delete({ where: { id: sessionId } });
}

export const SessionService = {
  getSessions,
  getSessionById,
  createSession,
  deleteSession,
};
