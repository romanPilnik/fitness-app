import { z } from 'zod';
import { difficulty, goal, splitType } from '@/features/programs/schemas';
import { intField, intFieldMin } from '@/lib/zodFields';

const templateExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  order: intFieldMin(1),
  targetSets: intFieldMin(1),
  notes: z.string().max(500).trim().optional(),
});

const templateWorkoutSchema = z.object({
  name: z.string().max(50).trim().min(1),
  dayNumber: intField(1, 14),
  exercises: z.array(templateExerciseSchema).min(1),
});

export const templateFormSchema = z.object({
  name: z.string().max(50).trim().min(1),
  description: z.string().max(500).trim().optional(),
  daysPerWeek: intField(1, 14),
  difficulty,
  goal,
  splitType,
  workouts: z.array(templateWorkoutSchema).min(1),
});

export type TemplateForm = z.infer<typeof templateFormSchema>;
