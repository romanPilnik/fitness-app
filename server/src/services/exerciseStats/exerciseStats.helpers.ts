import type { Types } from "mongoose";

import type { IExerciseStats } from "../../models/ExerciseStats.model.js";

export function buildLastPerformed(
  weight: number,
  reps: number,
  sets: number,
  date?: Date,
): NonNullable<IExerciseStats["lastPerformed"]> {
  return {
    date: date ?? new Date(),
    weight,
    reps,
    sets,
  };
}

export function buildSessionHistoryEntry(
  sessionId: Types.ObjectId,
  topSetWeight: number,
  topSetReps: number,
  totalSets: number,
  date?: Date,
): IExerciseStats["recentSessions"][number] {
  return {
    date: date ?? new Date(),
    topSetWeight,
    topSetReps,
    totalSets,
    sessionId,
  };
}

export function addToSessionHistory(
  current: IExerciseStats["recentSessions"],
  entry: IExerciseStats["recentSessions"][number],
): IExerciseStats["recentSessions"] {
  return [entry, ...current].slice(0, 10);
}

export function resolvePersonalRecord(
  current: IExerciseStats["personalRecord"],
  candidate: { weight: number; reps: number },
): IExerciseStats["personalRecord"] {
  const currentWeight = current?.weight ?? 0;
  const currentReps = current?.reps ?? 0;

  const isNewRecord =
    currentWeight === 0 ||
    candidate.weight > currentWeight ||
    (candidate.weight === currentWeight && candidate.reps > currentReps);

  if (!isNewRecord) return current;

  return {
    weight: candidate.weight,
    reps: candidate.reps,
    date: new Date(),
  };
}
