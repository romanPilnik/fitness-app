import type { PaginationQuery } from "../../types/api.types.js";
import type { Equipment, MuscleGroup } from "../../types/enums.types.js";
import type { SessionDTO } from "../session/session.dto.js";

export interface ExerciseStatsDTO {
  difficultyRating?: number;
  enjoymentRating?: number;
  exercise: {
    equipment: Equipment;
    name: string;
    primaryMuscle: MuscleGroup;
  };
  exerciseId: string;
  formNotes?: string;
  id: string;
  injuryNotes?: string;
  isFavorite: boolean;
  lastPerformed?: {
    date: Date;
    reps: number;
    sets: number;
    weight: number;
  };
  metrics: {
    avgDaysBetweenSessions?: number;
    totalSessions: number;
  };
  personalRecord?: {
    date: Date;
    reps: number;
    weight: number;
  };
  recentSessions: RecentSessionDTO[];
  userId: string;
}

export interface GetExerciseStatsByIdInputDTO {
  exerciseId: string;
  userId: string;
}

export interface GetExerciseStatsListInputDTO {
  filters?: {
    isFavorite?: boolean;
  };
  pagination?: PaginationQuery;
  userId: string;
}

export interface RecentSessionDTO {
  date: Date;
  sessionId: string;
  topSetReps: number;
  topSetWeight: number;
  totalSets: number;
}

export interface UpdateExerciseStatsInputDTO {
  exerciseId: string;
  updates: {
    difficultyRating?: number;
    enjoymentRating?: number;
    formNotes?: string;
    injuryNotes?: string;
    isFavorite?: boolean;
    isInjuryModified?: boolean;
    needsFormCheck?: boolean;
  };
  userId: string;
}

export interface UpdateFromSessionInputDTO {
  session: SessionDTO;
  userId: string;
}
