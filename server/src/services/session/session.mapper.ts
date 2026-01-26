import type { PaginateResult } from 'mongoose';
import type { Session } from '../../models/Session.model.js';
import type {
  SessionDTO,
  SessionSummaryDTO,
  SessionExerciseDTO,
  SetDTO,
  ExerciseFeedbackDTO,
} from './session.dto.js';

type PopulatedSet = {
  setType?: string;
  reps?: number;
  weight?: number;
  rir?: number;
  setCompleted?: boolean;
};

type PopulatedFeedback = {
  reportedMMC?: number;
  reportedPump?: number;
  reportedTension?: number;
  reportedCardioFatigue?: number;
  reportedJointFatigue?: number;
  reportedSystemicFatigue?: number;
};

type PopulatedSessionExercise = {
  exerciseId?: { toString(): string };
  order?: number;
  sets?: PopulatedSet[];
  feedback?: PopulatedFeedback;
  notes?: string;
};

type PopulatedSession = Session & {
  _id?: { toString(): string };
  userId?: { toString(): string };
  programId?: { toString(): string };
  exercises?: PopulatedSessionExercise[];
  createdAt?: Date;
  updatedAt?: Date;
};

function toSetDTO(set: PopulatedSet): SetDTO {
  return {
    setType: (set.setType as SetDTO['setType']) ?? 'straight set',
    reps: set.reps ?? 0,
    weight: set.weight ?? 0,
    rir: set.rir ?? 0,
    setCompleted: set.setCompleted ?? false,
  };
}

function toFeedbackDTO(feedback?: PopulatedFeedback): ExerciseFeedbackDTO | undefined {
  if (!feedback) return undefined;

  const hasAnyFeedback =
    feedback.reportedMMC !== undefined ||
    feedback.reportedPump !== undefined ||
    feedback.reportedTension !== undefined ||
    feedback.reportedCardioFatigue !== undefined ||
    feedback.reportedJointFatigue !== undefined ||
    feedback.reportedSystemicFatigue !== undefined;

  if (!hasAnyFeedback) return undefined;

  return {
    reportedMMC: feedback.reportedMMC,
    reportedPump: feedback.reportedPump,
    reportedTension: feedback.reportedTension,
    reportedCardioFatigue: feedback.reportedCardioFatigue,
    reportedJointFatigue: feedback.reportedJointFatigue,
    reportedSystemicFatigue: feedback.reportedSystemicFatigue,
  };
}

function toSessionExerciseDTO(exercise: PopulatedSessionExercise): SessionExerciseDTO {
  return {
    exerciseId: exercise.exerciseId ? exercise.exerciseId.toString() : '',
    order: exercise.order ?? 1,
    sets: (exercise.sets ?? []).map(toSetDTO),
    feedback: toFeedbackDTO(exercise.feedback),
    notes: exercise.notes ?? undefined,
  };
}

export function toSessionDTO(session: PopulatedSession): SessionDTO {
  const rawId = (session as { _id?: { toString(): string } })._id;
  const rawUserId = session.userId;
  const rawProgramId = session.programId;

  return {
    id: rawId ? rawId.toString() : '',
    userId: rawUserId ? rawUserId.toString() : '',
    programId: rawProgramId ? rawProgramId.toString() : '',
    workoutName: session.workoutName ?? '',
    dayNumber: session.dayNumber ?? undefined,
    sessionStatus: session.sessionStatus ?? 'completed',
    exercises: (session.exercises ?? []).map(toSessionExerciseDTO),
    datePerformed: session.datePerformed ?? new Date(),
    sessionDuration: session.sessionDuration ?? undefined,
    notes: session.notes ?? undefined,
    createdAt: session.createdAt ?? new Date(),
    updatedAt: session.updatedAt ?? new Date(),
  };
}

export function toSessionSummaryDTO(session: PopulatedSession): SessionSummaryDTO {
  const rawId = (session as { _id?: { toString(): string } })._id;
  const exercises = session.exercises ?? [];
  const totalSets = exercises.reduce((sum, ex) => sum + (ex.sets?.length ?? 0), 0);

  return {
    id: rawId ? rawId.toString() : '',
    workoutName: session.workoutName ?? '',
    sessionStatus: session.sessionStatus ?? 'completed',
    datePerformed: session.datePerformed ?? new Date(),
    sessionDuration: session.sessionDuration ?? undefined,
    exerciseCount: exercises.length,
    totalSets,
  };
}

export function mapPaginatedSessions(
  result: PaginateResult<PopulatedSession>,
): PaginateResult<SessionSummaryDTO> {
  return {
    ...result,
    docs: result.docs.map(toSessionSummaryDTO),
  };
}
