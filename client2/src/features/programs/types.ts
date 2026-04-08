export type ProgramWorkoutExercise = {
  id: string;
  programWorkoutId: string;
  exerciseId: string;
  exercise?: { id: string; name: string };
  order: number;
  targetSets: number;
  targetWeight: number | null;
  targetTotalReps: number | null;
  targetTopSetReps: number | null;
  targetRir: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProgramWorkout = {
  id: string;
  programId: string;
  name: string;
  dayNumber: number;
  createdAt: string;
  updatedAt: string;
  programWorkoutExercises: ProgramWorkoutExercise[];
};

export type ProgramSummary = {
  id: string;
  name: string;
  userId: string;
  sourceTemplateId: string | null;
  sourceTemplateName: string | null;
  createdFrom: string;
  description: string | null;
  difficulty: string;
  goal: string;
  splitType: string;
  daysPerWeek: number;
  status: string;
  startDate: string;
  createdAt: string;
  updatedAt: string;
};

export type ProgramDetail = ProgramSummary & {
  programWorkouts: ProgramWorkout[];
};
