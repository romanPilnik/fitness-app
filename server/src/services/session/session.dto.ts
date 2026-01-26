import type { SessionCompletionStatus, SetType } from '../../types/enums.types.js';
import type { PaginationQuery } from '../../types/api.types.js';

export type SetInputDTO = {
  setType?: SetType;
  reps: number;
  weight: number;
  rir: number;
  setCompleted?: boolean;
};

export type SetDTO = {
  setType: SetType;
  reps: number;
  weight: number;
  rir: number;
  setCompleted: boolean;
};

export type ExerciseFeedbackDTO = {
  reportedMMC?: number;
  reportedPump?: number;
  reportedTension?: number;
  reportedCardioFatigue?: number;
  reportedJointFatigue?: number;
  reportedSystemicFatigue?: number;
};

export type SessionExerciseInputDTO = {
  exerciseId: string;
  order: number;
  sets: SetInputDTO[];
  feedback?: ExerciseFeedbackDTO;
  notes?: string;
};

export type SessionExerciseDTO = {
  exerciseId: string;
  order: number;
  sets: SetDTO[];
  feedback?: ExerciseFeedbackDTO;
  notes?: string;
};

export type GetSessionsInputDTO = {
  userId: string;
  pagination?: PaginationQuery;
};

export type GetSessionByIdInputDTO = {
  sessionId: string;
};

export type CreateSessionInputDTO = {
  userId: string;
  sessionData: {
    programId: string;
    workoutName: string;
    dayNumber?: number;
    sessionStatus: SessionCompletionStatus;
    exercises: SessionExerciseInputDTO[];
    sessionDuration?: number;
    notes?: string;
  };
};

export type DeleteSessionInputDTO = {
  sessionId: string;
};


export type SessionDTO = {
  id: string;
  userId: string;
  programId: string;
  workoutName: string;
  dayNumber?: number;
  sessionStatus: SessionCompletionStatus;
  exercises: SessionExerciseDTO[];
  datePerformed: Date;
  sessionDuration?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SessionSummaryDTO = {
  id: string;
  workoutName: string;
  sessionStatus: SessionCompletionStatus;
  datePerformed: Date;
  sessionDuration?: number;
  exerciseCount: number;
  totalSets: number;
};
