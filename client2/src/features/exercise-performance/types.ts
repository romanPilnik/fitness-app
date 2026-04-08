export type ExercisePerformanceExerciseSnippet = {
  id: string;
  name: string;
  primaryMuscle: string;
  equipment: string;
};

export type ExercisePerformanceLastPerformed = {
  sessionId: string;
  datePerformed: string;
  workoutName: string;
  topSetWeight: number;
  topSetReps: number;
  totalSets: number;
};

export type ExercisePerformancePersonalRecord = {
  weight: number;
  reps: number;
  sessionId: string;
  datePerformed: string;
};

export type ExercisePerformanceHistoryRow = {
  sessionId: string;
  datePerformed: string;
  workoutName: string;
  topSetWeight: number;
  topSetReps: number;
  totalSets: number;
};

export type ExercisePerformanceSummary = {
  exerciseId: string;
  exercise: ExercisePerformanceExerciseSnippet;
  lastPerformed: ExercisePerformanceLastPerformed | null;
  personalRecord: ExercisePerformancePersonalRecord | null;
  recentHistory: ExercisePerformanceHistoryRow[];
};
