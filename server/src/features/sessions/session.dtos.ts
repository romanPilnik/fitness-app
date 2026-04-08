import type { SessionStatuses } from "@/generated/prisma/enums";
import type { CursorPaginationParams } from "@/lib/pagination";

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
  /** Filter sessions logged for this program (must belong to the user’s sessions). */
  programId?: string;
  /** Inclusive lower bound on `datePerformed` (ISO 8601). */
  dateFrom?: string;
  /** Inclusive upper bound on `datePerformed` (ISO 8601). */
  dateTo?: string;
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
