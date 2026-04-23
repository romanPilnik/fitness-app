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
  programWorkoutId: string;
  workoutName: string;
  dayNumber: number;
  sessionStatus: SessionStatuses;
  sessionDuration: number;
  exercises: SessionExerciseDTO[];
  /** When set, links the session to this planned occurrence and marks it completed. */
  occurrenceId?: string;
  /** ISO datetime for when the workout was performed; defaults to now. */
  datePerformed?: string;
  /** Used to match a planned occurrence to a calendar day when occurrenceId is omitted. */
  timeZone?: string;
  /**
   * User's local calendar date (YYYY-MM-DD) for this workout — preferred over deriving from
   * `datePerformed` so occurrence linking matches materialized `scheduledOn` dates.
   */
  performedOnLocalDate?: string;
}

export interface DeleteSessionDTO {
  sessionId: string;
  userId: string;
}
