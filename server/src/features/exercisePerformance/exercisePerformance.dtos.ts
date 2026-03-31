import type { Equipment, MuscleGroup } from "@/generated/prisma/enums";

export interface GetExercisePerformanceDTO {
  userId: string;
  exerciseId: string;
}

export interface ExercisePerformanceExerciseSnippet {
  id: string;
  name: string;
  primaryMuscle: MuscleGroup;
  equipment: Equipment;
}

export interface ExercisePerformanceLastPerformed {
  sessionId: string;
  datePerformed: string;
  workoutName: string;
  topSetWeight: number;
  topSetReps: number;
  totalSets: number;
}

export interface ExercisePerformancePersonalRecord {
  weight: number;
  reps: number;
  sessionId: string;
  datePerformed: string;
}

export interface ExercisePerformanceHistoryRow {
  sessionId: string;
  datePerformed: string;
  workoutName: string;
  topSetWeight: number;
  topSetReps: number;
  totalSets: number;
}

export interface ExercisePerformanceSummary {
  exerciseId: string;
  exercise: ExercisePerformanceExerciseSnippet;
  lastPerformed: ExercisePerformanceLastPerformed | null;
  personalRecord: ExercisePerformancePersonalRecord | null;
  recentHistory: ExercisePerformanceHistoryRow[];
}
