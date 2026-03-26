import type { SessionStatuses } from "../../generated/prisma/enums";
import type { CursorPaginationParams } from "../../lib/pagination";

interface SessionExerciseSetDTO {
  targetWeight?: number;
  targetReps?: number;
  reps: number;
  weight: number;
  rir: number;
  setCompleted: boolean;
}

interface SessionExerciseDTO {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetWeight?: number;
  targetTotalReps?: number;
  targetTopSetReps?: number;
  targetRir?: number;
  sets: SessionExerciseSetDTO[];
}

export interface GetSessionsDTO extends CursorPaginationParams {
  userId: string;
  sessionStatus?: SessionStatuses;
}

export interface GetSessionByIdDTO {
  sessionId: string;
  userId: string;
}

export interface CreateSessionDTO {
  userId: string;
  programId: string;
  workoutName: string;
  dayNumber: number;
  sessionStatus: SessionStatuses;
  sessionDuration: number;
  exercises: SessionExerciseDTO[];
}

export interface DeleteSessionDTO {
  sessionId: string;
  userId: string;
}
