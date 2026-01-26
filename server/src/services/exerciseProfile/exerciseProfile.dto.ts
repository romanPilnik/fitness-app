import type { PaginationQuery } from '../../types/api.types.js';
import type { Equipment, MuscleGroup } from '../../types/enums.types.js';
import { SessionDTO } from '../session/session.dto.js';

export type GetExerciseProfilesInputDTO = {
  userId: string;
  filters?: {
    isFavorite?: boolean;
    needsFormCheck?: boolean;
    isInjuryModified?: boolean;
  };
  pagination?: PaginationQuery;
};

export type GetExerciseProfileByIdInputDTO = {
  exerciseId: string;
  userId: string;
};

export type UpdateExerciseProfileInputDTO = {
  exerciseId: string;
  userId: string;
  updates: {
    isFavorite?: boolean;
    needsFormCheck?: boolean;
    isInjuryModified?: boolean;
    difficultyRating?: number;
    enjoymentRating?: number;
    formNotes?: string;
    injuryNotes?: string;
  };
};

export type updateFromSessionInputDTO = {
  userId: string;
  session: SessionDTO;
};

export type RecentSessionDTO = {
  date: Date;
  topSetWeight: number;
  topSetReps: number;
  totalSets: number;
  sessionId: string;
};

export type ExerciseProfileDTO = {
  id: string;
  userId: string;
  exerciseId: string;
  exercise: {
    name: string;
    primaryMuscle: MuscleGroup;
    equipment: Equipment;
  };
  lastPerformed?: {
    date: Date;
    weight: number;
    reps: number;
    sets: number;
  };
  personalRecord?: {
    weight: number;
    reps: number;
    date: Date;
  };
  recentSessions: RecentSessionDTO[];
  metrics: {
    totalSessions: number;
    avgDaysBetweenSessions?: number;
  };
  difficultyRating?: number;
  enjoymentRating?: number;
  formNotes?: string;
  injuryNotes?: string;
  isFavorite: boolean;
  needsFormCheck: boolean;
  isInjuryModified: boolean;
};
