import {z} from 'zod';
import {
  muscleGroupEnum,
  equipmentEnum,
  exerciseCategoryEnum,
  movementPatternEnum,
} from './shared.js';

// GET /api/v1/exercises
export const getExercises = z.object({
  query: z.object({
    primaryMuscle: muscleGroupEnum.optional(),
    equipment: equipmentEnum.optional(),
    category: exerciseCategoryEnum.optional(),
  }),
});

// GET /api/v1/exercises/:id
export const getExerciseById = z.object({
  params: z.object({
    id: z.string(),
  }),
});

// Shared schema for rep/rir range
const rangeSchema = z
  .object({
    min: z.number().optional(),
    max: z.number().optional(),
  })
  .optional();

// POST /api/v1/exercises
export const createExercise = z.object({
  body: z.object({
    name: z.string().max(50),
    equipment: equipmentEnum,
    primaryMuscle: muscleGroupEnum,
    secondaryMuscles: z.array(muscleGroupEnum).max(3).optional(),
    category: exerciseCategoryEnum,
    movementPattern: movementPatternEnum,
    typicalRepRange: z
      .object({
        min: z.number().min(1).max(50).optional(),
        max: z.number().min(1).max(50).optional(),
      })
      .optional(),
    rirBoundaries: z
      .object({
        min: z.number().min(0).max(10).optional(),
        max: z.number().min(0).max(10).optional(),
      })
      .optional(),
    instructions: z.string().max(500).optional(),
  }),
});

// PATCH /api/v1/exercises/:id
export const updateExercise = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().max(50).optional(),
    equipment: equipmentEnum.optional(),
    primaryMuscle: muscleGroupEnum.optional(),
    secondaryMuscles: z.array(muscleGroupEnum).max(3).optional(),
    category: exerciseCategoryEnum.optional(),
    movementPattern: movementPatternEnum.optional(),
    typicalRepRange: z
      .object({
        min: z.number().min(1).max(50).optional(),
        max: z.number().min(1).max(50).optional(),
      })
      .optional(),
    rirBoundaries: z
      .object({
        min: z.number().min(0).max(10).optional(),
        max: z.number().min(0).max(10).optional(),
      })
      .optional(),
    instructions: z.string().max(500).optional(),
  }),
});

// DELETE /api/v1/exercises/:id
export const deleteExercise = z.object({
  params: z.object({
    id: z.string(),
  }),
});

// Export inferred types
export type GetExercisesInput = z.infer<typeof getExercises>;
export type GetExerciseByIdInput = z.infer<typeof getExerciseById>;
export type CreateExerciseInput = z.infer<typeof createExercise>;
export type UpdateExerciseInput = z.infer<typeof updateExercise>;
export type DeleteExerciseInput = z.infer<typeof deleteExercise>;
