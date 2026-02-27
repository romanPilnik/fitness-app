import type { PaginateResult } from "mongoose";

import type { ExerciseStatsDTO } from "./exerciseStats.dto.js";

interface PopulatedExercise {
  _id?: { toString(): string };
  equipment: string;
  name: string;
  primaryMuscle: string;
}

interface PopulatedExerciseStats {
  _id?: { toString(): string };
  difficultyRating?: number;
  enjoymentRating?: number;
  exerciseId: PopulatedExercise;
  formNotes?: string;
  injuryNotes?: string;
  isFavorite?: boolean;
  lastPerformed?: {
    date?: Date;
    reps?: number;
    sets?: number;
    weight?: number;
  };
  metrics?: {
    avgDaysBetweenSessions?: number;
    totalSessions?: number;
  };
  personalRecord?: {
    date?: Date;
    reps?: number;
    weight?: number;
  };
  recentSessions?: RecentSession[];
  userId?: { toString(): string };
}

interface RecentSession {
  date?: Date;
  sessionId?: { toString(): string };
  topSetReps?: number;
  topSetWeight?: number;
  totalSets?: number;
}

export function mapPaginatedExerciseStats(
  result: PaginateResult<PopulatedExerciseStats>,
): PaginateResult<ExerciseStatsDTO> {
  return {
    ...result,
    docs: result.docs.map(toExerciseStatsDTO),
  };
}

export function toExerciseStatsDTO(
  stats: PopulatedExerciseStats,
): ExerciseStatsDTO {
  const rawId = stats._id;
  const exercise = stats.exerciseId;

  return {
    difficultyRating: stats.difficultyRating,
    enjoymentRating: stats.enjoymentRating,
    exercise: {
      equipment:
        exercise.equipment as ExerciseStatsDTO["exercise"]["equipment"],
      name: exercise.name,
      primaryMuscle:
        exercise.primaryMuscle as ExerciseStatsDTO["exercise"]["primaryMuscle"],
    },
    exerciseId: exercise._id ? exercise._id.toString() : "",
    formNotes: stats.formNotes,
    id: rawId ? rawId.toString() : "",
    injuryNotes: stats.injuryNotes,
    isFavorite: stats.isFavorite ?? false,
    lastPerformed: stats.lastPerformed?.date
      ? {
          date: stats.lastPerformed.date,
          reps: stats.lastPerformed.reps ?? 0,
          sets: stats.lastPerformed.sets ?? 0,
          weight: stats.lastPerformed.weight ?? 0,
        }
      : undefined,
    metrics: {
      avgDaysBetweenSessions: stats.metrics?.avgDaysBetweenSessions,
      totalSessions: stats.metrics?.totalSessions ?? 0,
    },
    personalRecord: stats.personalRecord?.date
      ? {
          date: stats.personalRecord.date,
          reps: stats.personalRecord.reps ?? 0,
          weight: stats.personalRecord.weight ?? 0,
        }
      : undefined,
    recentSessions: (stats.recentSessions ?? []).map((session) => ({
      date: session.date ?? new Date(),
      sessionId: session.sessionId ? session.sessionId.toString() : "",
      topSetReps: session.topSetReps ?? 0,
      topSetWeight: session.topSetWeight ?? 0,
      totalSets: session.totalSets ?? 0,
    })),
    userId: stats.userId ? stats.userId.toString() : "",
  };
}
