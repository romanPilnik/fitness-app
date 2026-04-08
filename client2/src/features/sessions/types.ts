export type SessionSummary = {
  id: string;
  userId: string;
  programId: string;
  workoutName: string;
  dayNumber: number;
  datePerformed: string;
  sessionStatus: string;
  sessionDuration: number;
  createdAt: string;
  updatedAt: string;
};

export type SessionExerciseSet = {
  id: string;
  sessionExerciseId: string;
  userId: string;
  targetWeight: number | null;
  targetReps: number | null;
  reps: number;
  weight: number;
  rir: number;
  setCompleted: boolean;
};

export type SessionExerciseRow = {
  id: string;
  sessionId: string;
  exerciseId: string;
  userId: string;
  order: number;
  targetSets: number;
  targetWeight: number | null;
  targetTotalReps: number | null;
  targetTopSetReps: number | null;
  targetRir: number | null;
  createdAt: string;
  updatedAt: string;
  exercise: {
    id: string;
    name: string;
    category: string;
    equipment: string;
    movementPattern: string;
    primaryMuscle: string;
    secondaryMuscles: string[];
    instructions: string | null;
    createdByUserId: string | null;
    createdAt: string;
    updatedAt: string;
  };
  sessionExerciseSets: SessionExerciseSet[];
};

export type SessionDetail = SessionSummary & {
  program: { id: string; name: string; userId: string } | null;
  sessionExercises: SessionExerciseRow[];
};
