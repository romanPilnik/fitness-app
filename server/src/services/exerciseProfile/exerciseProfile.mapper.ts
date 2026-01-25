import type { PaginateResult } from 'mongoose';
import type { ExerciseProfileDTO } from './exerciseProfile.dto.js';

type PopulatedExercise = {
  _id?: { toString(): string };
  name: string;
  primaryMuscle: string;
  equipment: string;
};

type PopulatedExerciseProfile = {
  _id?: { toString(): string };
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
  metrics?: {
    totalSessions?: number;
    avgDaysBetweenSessions?: number;
  };
  difficultyRating?: number;
  enjoymentRating?: number;
  formNotes?: string;
  injuryNotes?: string;
  isFavorite?: boolean;
  needsFormCheck?: boolean;
  isInjuryModified?: boolean;
};

export function toExerciseProfileDTO(profile: PopulatedExerciseProfile): ExerciseProfileDTO {
  const rawId = profile._id;
  const exercise = profile.exerciseId;

  return {
    id: rawId ? rawId.toString() : '',
    exercise: {
      id: exercise._id ? exercise._id.toString() : '',
      name: exercise.name,
      primaryMuscle: exercise.primaryMuscle as ExerciseProfileDTO['exercise']['primaryMuscle'],
      equipment: exercise.equipment as ExerciseProfileDTO['exercise']['equipment'],
    },
    lastPerformed: profile.lastPerformed?.date
      ? {
          date: profile.lastPerformed.date,
          weight: profile.lastPerformed.weight ?? 0,
          reps: profile.lastPerformed.reps ?? 0,
          sets: profile.lastPerformed.sets ?? 0,
        }
      : undefined,
    personalRecord: profile.personalRecord?.date
      ? {
          weight: profile.personalRecord.weight ?? 0,
          reps: profile.personalRecord.reps ?? 0,
          date: profile.personalRecord.date,
        }
      : undefined,
    metrics: {
      totalSessions: profile.metrics?.totalSessions ?? 0,
      avgDaysBetweenSessions: profile.metrics?.avgDaysBetweenSessions,
    },
    difficultyRating: profile.difficultyRating,
    enjoymentRating: profile.enjoymentRating,
    formNotes: profile.formNotes,
    injuryNotes: profile.injuryNotes,
    isFavorite: profile.isFavorite ?? false,
    needsFormCheck: profile.needsFormCheck ?? false,
    isInjuryModified: profile.isInjuryModified ?? false,
  };
}

export function mapPaginatedExerciseProfiles(
  result: PaginateResult<PopulatedExerciseProfile>,
): PaginateResult<ExerciseProfileDTO> {
  return {
    ...result,
    docs: result.docs.map(toExerciseProfileDTO),
  };
}