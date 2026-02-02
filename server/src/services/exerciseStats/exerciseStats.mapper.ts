import type { PaginateResult } from 'mongoose';
import type { ExerciseStatsDTO } from './exerciseStats.dto.js';

type PopulatedExercise = {
  _id?: { toString(): string };
  name: string;
  primaryMuscle: string;
  equipment: string;
};

type RecentSession = {
  date?: Date;
  topSetWeight?: number;
  topSetReps?: number;
  totalSets?: number;
  sessionId?: { toString(): string };
};

type PopulatedExerciseStats = {
  _id?: { toString(): string };
  userId?: { toString(): string };
  exerciseId: PopulatedExercise;
  lastPerformed?: {
    date?: Date;
    weight?: number;
    reps?: number;
    sets?: number;
  };
  personalRecord?: {
    weight?: number;
    reps?: number;
    date?: Date;
  };
  recentSessions?: RecentSession[];
  metrics?: {
    totalSessions?: number;
    avgDaysBetweenSessions?: number;
  };
  difficultyRating?: number;
  enjoymentRating?: number;
  formNotes?: string;
  injuryNotes?: string;
  isFavorite?: boolean;
};

export function toExerciseStatsDTO(stats: PopulatedExerciseStats): ExerciseStatsDTO {
  const rawId = stats._id;
  const exercise = stats.exerciseId;

  return {
    id: rawId ? rawId.toString() : '',
    userId: stats.userId ? stats.userId.toString() : '',
    exerciseId: exercise._id ? exercise._id.toString() : '',
    exercise: {
      name: exercise.name,
      primaryMuscle: exercise.primaryMuscle as ExerciseStatsDTO['exercise']['primaryMuscle'],
      equipment: exercise.equipment as ExerciseStatsDTO['exercise']['equipment'],
    },
    lastPerformed: stats.lastPerformed?.date
      ? {
          date: stats.lastPerformed.date,
          weight: stats.lastPerformed.weight ?? 0,
          reps: stats.lastPerformed.reps ?? 0,
          sets: stats.lastPerformed.sets ?? 0,
        }
      : undefined,
    personalRecord: stats.personalRecord?.date
      ? {
          weight: stats.personalRecord.weight ?? 0,
          reps: stats.personalRecord.reps ?? 0,
          date: stats.personalRecord.date,
        }
      : undefined,
    recentSessions: (stats.recentSessions ?? []).map((session) => ({
      date: session.date ?? new Date(),
      topSetWeight: session.topSetWeight ?? 0,
      topSetReps: session.topSetReps ?? 0,
      totalSets: session.totalSets ?? 0,
      sessionId: session.sessionId ? session.sessionId.toString() : '',
    })),
    metrics: {
      totalSessions: stats.metrics?.totalSessions ?? 0,
      avgDaysBetweenSessions: stats.metrics?.avgDaysBetweenSessions,
    },
    difficultyRating: stats.difficultyRating,
    enjoymentRating: stats.enjoymentRating,
    formNotes: stats.formNotes,
    injuryNotes: stats.injuryNotes,
    isFavorite: stats.isFavorite ?? false,
  };
}

export function mapPaginatedExerciseStats(
  result: PaginateResult<PopulatedExerciseStats>,
): PaginateResult<ExerciseStatsDTO> {
  return {
    ...result,
    docs: result.docs.map(toExerciseStatsDTO),
  };
}