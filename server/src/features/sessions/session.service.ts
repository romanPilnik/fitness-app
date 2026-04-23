import { BadRequestError, NotFoundError } from "@/errors/index";
import { ERROR_CODES } from "@/types/error.types";
import { OccurrenceStatus } from "@/generated/prisma/enums.js";
import type { SessionModel } from "@/generated/prisma/models";
import type { Prisma } from "@/generated/prisma/client";
import {
  dateKeyToDbDate,
  startDateKeyInTimeZone,
} from "@/features/programs/programSchedule.js";
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
    programWorkoutId,
    workoutName,
    dayNumber,
    sessionStatus,
    exercises,
    sessionDuration,
    occurrenceId,
    datePerformed: datePerformedRaw,
    timeZone,
    performedOnLocalDate,
  } = input;

  const datePerformed = datePerformedRaw ? new Date(datePerformedRaw) : new Date();

  const program = await prisma.program.findUnique({
    where: { id: programId },
    select: { userId: true },
  });
  if (program?.userId !== userId) {
    throw new NotFoundError("Program not found", ERROR_CODES.PROGRAM_NOT_FOUND);
  }

  const programWorkout = await prisma.programWorkout.findUnique({
    where: { id: programWorkoutId },
    select: { programId: true },
  });
  if (!programWorkout) {
    throw new NotFoundError("Workout not found", ERROR_CODES.WORKOUT_NOT_FOUND);
  }
  if (programWorkout.programId !== programId) {
    throw new BadRequestError(
      "Program workout does not belong to this program",
      ERROR_CODES.INVALID_INPUT,
    );
  }

  const session = await prisma.session.create({
    data: {
      userId,
      programId,
      programWorkoutId,
      workoutName,
      dayNumber,
      sessionStatus,
      sessionDuration,
      datePerformed,
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

  const tz = timeZone ?? "UTC";

  if (occurrenceId) {
    const occ = await prisma.programWorkoutOccurrence.findFirst({
      where: {
        id: occurrenceId,
        programId,
        programWorkoutId,
        program: { userId },
      },
    });
    if (!occ) {
      throw new NotFoundError("Occurrence not found", ERROR_CODES.NOT_FOUND);
    }
    await prisma.programWorkoutOccurrence.update({
      where: { id: occurrenceId },
      data: {
        sessionId: session.id,
        status: OccurrenceStatus.completed,
      },
    });
  } else {
    const dayKey =
      performedOnLocalDate ??
      startDateKeyInTimeZone(datePerformed, tz);
    const occ = await prisma.programWorkoutOccurrence.findFirst({
      where: {
        programId,
        programWorkoutId,
        scheduledOn: dateKeyToDbDate(dayKey),
        status: OccurrenceStatus.planned,
      },
    });
    if (occ) {
      await prisma.programWorkoutOccurrence.update({
        where: { id: occ.id },
        data: {
          sessionId: session.id,
          status: OccurrenceStatus.completed,
        },
      });
    }
  }

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

  await prisma.programWorkoutOccurrence.updateMany({
    where: { sessionId },
    data: { sessionId: null, status: OccurrenceStatus.planned },
  });

  await prisma.session.delete({ where: { id: sessionId } });
}

export const SessionService = {
  getSessions,
  getSessionById,
  createSession,
  deleteSession,
};
