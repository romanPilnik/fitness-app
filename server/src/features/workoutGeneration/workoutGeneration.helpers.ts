import { NotFoundError } from "@/errors/index";
import { ERROR_CODES } from "@/types/error.types";
import type { Prisma } from "@/generated/prisma/client";
import { GeneratedWorkoutStatus, SessionStatuses as SessionStatusesEnum } from "@/generated/prisma/enums.js";
import { prisma } from "@/lib/prisma";
import type { AiWorkoutGenerationOutput } from "./workoutGeneration.validation.js";
import type {
  BuildUserPromptInput,
  CompletedSessionExerciseRow,
  CompletedSessionSnapshot,
  ExerciseContextRow,
  GeneratedTargetsRow,
  ProgramTargetsRow,
  ProgramWorkoutHistoryExerciseRow,
  ProgramWorkoutHistorySession,
  SessionSetPerformed,
} from "./prompts/progressionPromptTypes.js";

const HISTORY_FETCH = 15;

const sessionForGenerationInclude = {
  sessionExercises: {
    orderBy: { order: "asc" as const },
    include: {
      exercise: true,
      sessionExerciseSets: true,
    },
  },
} as const;

export type SessionForGeneration = NonNullable<
  Awaited<ReturnType<typeof fetchSessionForGeneration>>
>;

export async function fetchSessionForGeneration(sessionId: string, userId: string) {
  return prisma.session.findFirst({
    where: { id: sessionId, userId },
    include: sessionForGenerationInclude,
  });
}

export async function loadWorkoutGenerationContext(sessionId: string, userId: string) {
  const session = await fetchSessionForGeneration(sessionId, userId);
  if (!session) {
    throw new NotFoundError("Session not found", ERROR_CODES.SESSION_NOT_FOUND);
  }

  const programWorkoutId = session.programWorkoutId;
  if (!programWorkoutId) {
    throw new NotFoundError("Session is not linked to a program workout", ERROR_CODES.SESSION_NOT_FOUND);
  }

  const [user, programWorkout, previousCompletedGeneration] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { units: true, aiConfig: true },
    }),
    prisma.programWorkout.findUnique({
      where: { id: programWorkoutId },
      include: {
        programWorkoutExercises: {
          orderBy: { order: "asc" },
          include: { exercise: true },
        },
      },
    }),
    prisma.generatedWorkout.findFirst({
      where: {
        programWorkoutId,
        status: GeneratedWorkoutStatus.completed,
        NOT: { triggerSessionId: sessionId },
      },
      orderBy: { createdAt: "desc" },
      include: {
        exercises: {
          orderBy: { order: "asc" },
          include: { sets: { orderBy: { setNumber: "asc" } } },
        },
      },
    }),
  ]);

  if (!user) {
    throw new NotFoundError("User not found", ERROR_CODES.USER_NOT_FOUND);
  }
  if (!programWorkout) {
    throw new NotFoundError("Workout not found", ERROR_CODES.WORKOUT_NOT_FOUND);
  }
  if (programWorkout.programId !== session.programId) {
    throw new NotFoundError("Workout not found", ERROR_CODES.WORKOUT_NOT_FOUND);
  }

  const rawHistory = await prisma.session.findMany({
    where: {
      userId,
      programWorkoutId,
      id: { not: sessionId },
      sessionStatus: { in: [SessionStatusesEnum.completed, SessionStatusesEnum.partially] },
    },
    orderBy: { datePerformed: "desc" },
    take: HISTORY_FETCH,
    include: {
      sessionExercises: {
        orderBy: { order: "asc" },
        include: { sessionExerciseSets: true },
      },
    },
  });

  const historySessions: ProgramWorkoutHistorySession[] = rawHistory.map((s) => ({
    sessionId: s.id,
    datePerformed: s.datePerformed.toISOString(),
    sessionStatus: s.sessionStatus,
    exercises: mapSessionToHistoryExercises(s.sessionExercises),
  }));

  return {
    session,
    user,
    programWorkout,
    previousCompletedGeneration,
    historySessions,
  };
}

function mapSessionToHistoryExercises(
  sessionExercises: {
    exerciseId: string;
    order: number;
    sessionExerciseSets: { id: string; weight: number; reps: number; rir: number }[];
  }[],
): ProgramWorkoutHistoryExerciseRow[] {
  return sessionExercises.map((se) => ({
    exerciseId: se.exerciseId,
    order: se.order,
    sets: [...se.sessionExerciseSets]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((set, idx) => ({
        setNumber: idx + 1,
        weightKg: set.weight,
        reps: set.reps,
        rir: set.rir,
      })),
  }));
}

function mapCompletedSession(session: SessionForGeneration): CompletedSessionSnapshot {
  return {
    sessionId: session.id,
    datePerformed: session.datePerformed.toISOString(),
    sessionStatus: session.sessionStatus,
    exercises: session.sessionExercises.map((se): CompletedSessionExerciseRow => ({
      exerciseId: se.exerciseId,
      order: se.order,
      targetSets: se.targetSets,
      targetWeightKg: se.targetWeight ?? null,
      targetTotalReps: se.targetTotalReps,
      targetTopSetReps: se.targetTopSetReps,
      targetRir: se.targetRir,
      sets: [...se.sessionExerciseSets]
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((set, idx): SessionSetPerformed => ({
          setNumber: idx + 1,
          weightKg: set.weight,
          reps: set.reps,
          rir: set.rir,
          setCompleted: set.setCompleted,
        })),
    })),
  };
}

function programWorkoutTargetsFromExercises(
  programWorkoutExercises: Prisma.ProgramWorkoutExerciseGetPayload<{
    include: { exercise: true };
  }>[],
): ProgramTargetsRow[] {
  return programWorkoutExercises.map((pwe) => ({
    exerciseId: pwe.exerciseId,
    order: pwe.order,
    targetSets: pwe.targetSets,
    targetWeightKg: pwe.targetWeight,
    targetTotalReps: pwe.targetTotalReps,
    targetTopSetReps: pwe.targetTopSetReps,
    targetRir: pwe.targetRir,
    notes: pwe.notes,
  }));
}

function exerciseContextsFromProgram(
  programWorkoutExercises: {
    order: number;
    exerciseId: string;
    exercise: {
      name: string;
      category: ExerciseContextRow["category"];
      equipment: ExerciseContextRow["equipment"];
      movementPattern: ExerciseContextRow["movementPattern"];
      primaryMuscle: ExerciseContextRow["primaryMuscle"];
      secondaryMuscles: ExerciseContextRow["secondaryMuscles"];
    };
  }[],
): ExerciseContextRow[] {
  return programWorkoutExercises.map((row) => ({
    order: row.order,
    exerciseId: row.exerciseId,
    name: row.exercise.name,
    category: row.exercise.category,
    equipment: row.exercise.equipment,
    movementPattern: row.exercise.movementPattern,
    primaryMuscle: row.exercise.primaryMuscle,
    secondaryMuscles: row.exercise.secondaryMuscles,
  }));
}

function previousTargetsFromGeneration(gen: {
  exercises: {
    exerciseId: string;
    order: number;
    targetSets: number;
    targetRir: number | null;
    notes: string | null;
    sets: {
      setNumber: number;
      targetWeight: number;
      targetReps: number;
      targetRir: number | null;
    }[];
  }[];
}): GeneratedTargetsRow[] {
  return gen.exercises.map((ex) => ({
    exerciseId: ex.exerciseId,
    order: ex.order,
    targetSets: ex.targetSets,
    targetRir: ex.targetRir,
    notes: ex.notes,
    sets: ex.sets.map((s) => ({
      setNumber: s.setNumber,
      targetWeightKg: s.targetWeight,
      targetReps: s.targetReps,
      targetRir: s.targetRir,
    })),
  }));
}

export function buildUserPromptInputFromContext(
  ctx: Awaited<ReturnType<typeof loadWorkoutGenerationContext>>,
): BuildUserPromptInput {
  const { session, user, programWorkout, previousCompletedGeneration, historySessions } = ctx;

  const programWorkoutTargets = programWorkoutTargetsFromExercises(programWorkout.programWorkoutExercises);

  const previousGeneratedTargets: GeneratedTargetsRow[] | null =
    previousCompletedGeneration !== null
      ? previousTargetsFromGeneration(previousCompletedGeneration)
      : null;

  return {
    units: user.units,
    programWorkoutName: programWorkout.name,
    programWorkoutDayNumber: programWorkout.dayNumber,
    completedSession: mapCompletedSession(session),
    exerciseContexts: exerciseContextsFromProgram(programWorkout.programWorkoutExercises),
    programWorkoutTargets,
    previousGeneratedTargets,
    historySessions,
    historyTrendSummary: null,
  };
}

export function orderAiExercisesLikeProgram(
  programExerciseIdsOrdered: string[],
  output: AiWorkoutGenerationOutput,
): AiWorkoutGenerationOutput["exercises"] {
  const byId = new Map(output.exercises.map((e) => [e.exerciseId, e]));
  const ordered: AiWorkoutGenerationOutput["exercises"] = [];
  for (const id of programExerciseIdsOrdered) {
    const row = byId.get(id);
    if (!row) {
      throw new Error(`Missing exercise ${id} in AI output`);
    }
    ordered.push(row);
  }
  if (ordered.length !== programExerciseIdsOrdered.length || byId.size !== programExerciseIdsOrdered.length) {
    throw new Error("AI output exercise list does not match program workout");
  }
  return ordered;
}

export function buildGeneratedWorkoutCreateArgs(input: {
  userId: string;
  programId: string;
  programWorkoutId: string;
  triggerSessionId: string;
  aiProvider: string;
  aiModel: string;
  status: GeneratedWorkoutStatus;
  exercisesOrdered: AiWorkoutGenerationOutput["exercises"];
  orderByExerciseId: Map<string, number>;
  tokenInput?: number;
  tokenOutput?: number;
  retryCount?: number;
  latencyMs?: number;
}): Prisma.GeneratedWorkoutCreateInput {
  const {
    userId,
    programId,
    programWorkoutId,
    triggerSessionId,
    aiProvider,
    aiModel,
    status,
    exercisesOrdered,
    orderByExerciseId,
    tokenInput,
    tokenOutput,
    retryCount,
    latencyMs,
  } = input;

  return {
    user: { connect: { id: userId } },
    program: { connect: { id: programId } },
    programWorkout: { connect: { id: programWorkoutId } },
    triggerSession: { connect: { id: triggerSessionId } },
    aiProvider,
    aiModel,
    status,
    tokenInput: tokenInput ?? null,
    tokenOutput: tokenOutput ?? null,
    retryCount: retryCount ?? 0,
    latencyMs: latencyMs ?? null,
    exercises: {
      create: exercisesOrdered.map((ex) => {
        const order = orderByExerciseId.get(ex.exerciseId);
        if (order === undefined) {
          throw new Error(`Missing program order for exercise ${ex.exerciseId}`);
        }
        return {
          exerciseId: ex.exerciseId,
          order,
          targetSets: ex.targetSets,
          targetRir: ex.targetRir,
          notes: ex.notes,
          sets: {
            create: ex.sets.map((s) => ({
              setNumber: s.setNumber,
              targetWeight: s.targetWeight,
              targetReps: s.targetReps,
              targetRir: s.targetRir,
            })),
          },
        };
      }),
    },
  };
}
