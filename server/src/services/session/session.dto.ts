import type { SessionStatus, SetType } from "../../types/enums.types.js";
import type { PaginationQuery } from "../../types/api.types.js";

export interface SetInputDTO {
  setType?: SetType;
  reps: number;
  weight: number;
  rir: number;
  setCompleted?: boolean;
}

export interface SetDTO {
  setType: SetType;
  reps: number;
  weight: number;
  rir: number;
  setCompleted: boolean;
}

export interface ExerciseFeedbackDTO {
  reportedMMC?: number;
  reportedPump?: number;
  reportedTension?: number;
  reportedCardioFatigue?: number;
  reportedJointFatigue?: number;
  reportedSystemicFatigue?: number;
}

export interface SessionExerciseInputDTO {
  exerciseId: string;
  order: number;
  sets: SetInputDTO[];
  feedback?: ExerciseFeedbackDTO;
  notes?: string;
}

export interface SessionExerciseDTO {
  exerciseId: string;
  order: number;
  sets: SetDTO[];
  feedback?: ExerciseFeedbackDTO;
  notes?: string;
}

export interface GetSessionsInputDTO {
  userId: string;
  pagination?: PaginationQuery;
}

export interface GetSessionByIdInputDTO {
  sessionId: string;
  userId: string;
}

export interface CreateSessionInputDTO {
  userId: string;
  sessionData: {
    programId: string;
    workoutName: string;
    dayNumber?: number;
    sessionStatus: SessionStatus;
    exercises: SessionExerciseInputDTO[];
    sessionDuration?: number;
    notes?: string;
  };
}

export interface DeleteSessionInputDTO {
  sessionId: string;
  userId: string;
}

export interface SessionDTO {
  id: string;
  userId: string;
  programId: string;
  workoutName: string;
  dayNumber?: number;
  sessionStatus: SessionStatus;
  exercises: SessionExerciseDTO[];
  datePerformed: Date;
  sessionDuration?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionSummaryDTO {
  id: string;
  workoutName: string;
  sessionStatus: SessionStatus;
  datePerformed: Date;
  sessionDuration?: number;
  exerciseCount: number;
  totalSets: number;
}
