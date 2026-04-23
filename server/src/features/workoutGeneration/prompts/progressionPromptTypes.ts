import type {
  Equipment,
  ExerciseCategory,
  MovementPattern,
  MuscleGroup,
  SessionStatuses,
  Units,
} from "@/generated/prisma/enums.js";

export interface ExerciseContextRow {
  order: number;
  exerciseId: string;
  name: string;
  category: ExerciseCategory;
  equipment: Equipment;
  movementPattern: MovementPattern;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
}

export interface SessionSetPerformed {
  setNumber: number;
  weightKg: number;
  reps: number;
  rir: number;
  setCompleted: boolean;
}

export interface CompletedSessionExerciseRow {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetWeightKg: number | null;
  targetTotalReps: number | null;
  targetTopSetReps: number | null;
  targetRir: number | null;
  sets: SessionSetPerformed[];
}

export interface CompletedSessionSnapshot {
  sessionId: string;
  datePerformed: string;
  sessionStatus: SessionStatuses;
  exercises: CompletedSessionExerciseRow[];
}

export interface ProgramTargetsRow {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetWeightKg: number | null;
  targetTotalReps: number | null;
  targetTopSetReps: number | null;
  targetRir: number | null;
  notes: string | null;
}

export interface GeneratedTargetsRow {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetRir: number | null;
  notes: string | null;
  sets: {
    setNumber: number;
    targetWeightKg: number;
    targetReps: number;
    targetRir: number | null;
  }[];
}

export interface ProgramWorkoutHistorySession {
  sessionId: string;
  datePerformed: string;
  sessionStatus: SessionStatuses;
  exercises: ProgramWorkoutHistoryExerciseRow[];
}

export interface ProgramWorkoutHistoryExerciseRow {
  exerciseId: string;
  order: number;
  sets: {
    setNumber: number;
    weightKg: number;
    reps: number;
    rir: number;
  }[];
}

export interface BuildUserPromptInput {
  units: Units;
  programWorkoutName?: string;
  programWorkoutDayNumber?: number;
  completedSession: CompletedSessionSnapshot;
  exerciseContexts: ExerciseContextRow[];
  programWorkoutTargets: ProgramTargetsRow[];
  previousGeneratedTargets: GeneratedTargetsRow[] | null;
  historySessions: ProgramWorkoutHistorySession[];
  /**
   * Optional narrative from the orchestration layer (e.g. hit/miss vs targets, trends).
   * When omitted, the model infers trends from raw history sets only.
   */
  historyTrendSummary?: string | null;
}
