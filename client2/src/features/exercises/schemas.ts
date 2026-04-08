import { z } from 'zod';
import {
  EQUIPMENT_VALUES,
  EXERCISE_CATEGORY_VALUES,
  MOVEMENT_PATTERN_VALUES,
  MUSCLE_GROUP_VALUES,
} from '@/lib/apiFilterOptions';

const equipment = z.enum(EQUIPMENT_VALUES);
const primaryMuscle = z.enum(MUSCLE_GROUP_VALUES);
const secondaryMuscle = z.enum(MUSCLE_GROUP_VALUES);
const category = z.enum(EXERCISE_CATEGORY_VALUES);
const movementPattern = z.enum(MOVEMENT_PATTERN_VALUES);

export const createExerciseFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  equipment,
  primaryMuscle,
  secondaryMuscles: z.array(secondaryMuscle).max(3),
  category,
  movementPattern,
  instructions: z.string().max(500).optional(),
});

export type CreateExerciseFormValues = z.infer<typeof createExerciseFormSchema>;
