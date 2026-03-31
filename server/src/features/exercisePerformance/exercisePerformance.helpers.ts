import { prisma } from "@/lib/prisma";
import type {
  ExercisePerformanceHistoryRow,
  ExercisePerformanceLastPerformed,
  ExercisePerformancePersonalRecord,
} from "./exercisePerformance.dtos";

export function pickTopSetWeightReps(
  sets: readonly { weight: number; reps: number }[],
): { weight: number; reps: number } | null {
  const head = sets.at(0);
  if (head === undefined) return null;
  let bestW = head.weight;
  let bestR = head.reps;
  for (const s of sets.slice(1)) {
    if (s.weight > bestW || (s.weight === bestW && s.reps > bestR)) {
      bestW = s.weight;
      bestR = s.reps;
    }
  }
  return { weight: bestW, reps: bestR };
}

export async function getExercisePerformanceLastPerformed(
  exerciseId: string,
  userId: string,
): Promise<ExercisePerformanceLastPerformed | null> {
  const sessionExercise = await prisma.sessionExercise.findFirst({
    where: { exerciseId, userId },
    orderBy: [{ session: { datePerformed: "desc" } }, { id: "desc" }],
    include: {
      session: {
        select: {
          id: true,
          workoutName: true,
          datePerformed: true,
        },
      },
      sessionExerciseSets: {
        select: {
          weight: true,
          reps: true,
          rir: true,
          setCompleted: true,
        },
      },
    },
  });

  if (!sessionExercise) {
    return null;
  }

  const topSet = pickTopSetWeightReps(sessionExercise.sessionExerciseSets);
  const topSetWeight = topSet?.weight ?? 0;
  const topSetReps = topSet?.reps ?? 0;

  const lastPerformed: ExercisePerformanceLastPerformed = {
    sessionId: sessionExercise.sessionId,
    datePerformed: sessionExercise.session.datePerformed.toISOString(),
    workoutName: sessionExercise.session.workoutName,
    topSetWeight,
    topSetReps,
    totalSets: sessionExercise.sessionExerciseSets.length,
  };

  return lastPerformed;
}

export async function getExercisePerformancePersonalRecord(
  exerciseId: string,
  userId: string,
): Promise<ExercisePerformancePersonalRecord | null> {
  const exercisePerformances = await prisma.sessionExercise.findMany({
    where: { exerciseId, userId },
    include: {
      session: {
        select: {
          id: true,
          datePerformed: true,
        },
      },
      sessionExerciseSets: {
        select: {
          weight: true,
          reps: true,
        },
      },
    },
  });

  if (exercisePerformances.length === 0) {
    return null;
  }

  let best: ExercisePerformancePersonalRecord | null = null;

  for (const row of exercisePerformances) {
    const top = pickTopSetWeightReps(row.sessionExerciseSets);
    if (!top) continue;
    if (
      !best ||
      top.weight > best.weight ||
      (top.weight === best.weight && top.reps > best.reps)
    ) {
      best = {
        weight: top.weight,
        reps: top.reps,
        sessionId: row.sessionId,
        datePerformed: row.session.datePerformed.toISOString(),
      };
    }
  }

  return best;
}

export async function getExercisePerformanceHistory(
  exerciseId: string,
  userId: string,
): Promise<ExercisePerformanceHistoryRow[]> {
  const history = await prisma.sessionExercise.findMany({
    where: { exerciseId, userId },
    orderBy: [{ session: { datePerformed: "desc" } }, { id: "desc" }],
    include: {
      session: { select: { id: true, workoutName: true, datePerformed: true } },
      sessionExerciseSets: { select: { weight: true, reps: true } },
    },
  });

  const historyRows: ExercisePerformanceHistoryRow[] = [];
  for (const sessionExercise of history) {
    const top = pickTopSetWeightReps(sessionExercise.sessionExerciseSets);
    const topSetWeight = top?.weight ?? 0;
    const topSetReps = top?.reps ?? 0;
    const totalSets = sessionExercise.sessionExerciseSets.length;
    historyRows.push({
      sessionId: sessionExercise.sessionId,
      datePerformed: sessionExercise.session.datePerformed.toISOString(),
      workoutName: sessionExercise.session.workoutName,
      topSetWeight,
      topSetReps,
      totalSets,
    });
  }
  return historyRows;
}
