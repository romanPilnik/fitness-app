export type TemplateSummary = {
  id: string;
  name: string;
  description: string | null;
  daysPerWeek: number;
  difficulty: string;
  splitType: string;
  goal: string;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TemplateWorkoutExercise = {
  id: string;
  templateWorkoutId: string;
  exerciseId: string;
  order: number;
  targetSets: number;
  targetWeight: number | null;
  targetTotalReps: number | null;
  targetTopSetReps: number | null;
  targetRir: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  exercise?: { id: string; name: string };
};

export type TemplateWorkout = {
  id: string;
  templateId: string;
  name: string;
  dayNumber: number;
  createdAt: string;
  updatedAt: string;
  exercises: TemplateWorkoutExercise[];
};

export type TemplateDetail = TemplateSummary & {
  workouts: TemplateWorkout[];
};
