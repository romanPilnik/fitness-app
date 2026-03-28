import { z } from "zod";
import {
  MuscleGroup,
  Equipment,
  ExerciseCategory,
  MovementPattern,
} from "@/generated/prisma/enums";
import { cursorPaginationSchema } from "@/lib/pagination";

export const getExercisesSchema = z.object({
  query: z
    .object({
      primaryMuscle: z.enum(MuscleGroup).optional(),
      equipment: z.enum(Equipment).optional(),
      category: z.enum(ExerciseCategory).optional(),
      movementPattern: z.enum(MovementPattern).optional(),
    })
    .extend(cursorPaginationSchema.shape),
});

export const getExerciseByIdSchema = z.object({
  params: z.object({
    id: z.cuid(),
  }),
});

export const createExerciseSchema = z.object({
  body: z.object({
    name: z.string().max(50),
    equipment: z.enum(Equipment),
    primaryMuscle: z.enum(MuscleGroup),
    secondaryMuscles: z.array(z.enum(MuscleGroup)).max(3).default([]),
    category: z.enum(ExerciseCategory),
    movementPattern: z.enum(MovementPattern),
    instructions: z.string().max(500).optional(),
  }),
});

export const updateExerciseSchema = z.object({
  params: z.object({
    id: z.cuid(),
  }),
  body: z.object({
    name: z.string().max(50).optional(),
    equipment: z.enum(Equipment).optional(),
    primaryMuscle: z.enum(MuscleGroup).optional(),
    secondaryMuscles: z.array(z.enum(MuscleGroup)).max(3).optional(),
    category: z.enum(ExerciseCategory).optional(),
    movementPattern: z.enum(MovementPattern).optional(),
    instructions: z.string().max(500).optional(),
  }),
});

export const deleteExerciseSchema = z.object({
  params: z.object({
    id: z.cuid(),
  }),
});

export type GetExercisesQuery = z.infer<typeof getExercisesSchema>["query"];
export type GetExerciseByIdParams = z.infer<
  typeof getExerciseByIdSchema
>["params"];
export type CreateExerciseBody = z.infer<typeof createExerciseSchema>["body"];
export type UpdateExerciseParams = z.infer<
  typeof updateExerciseSchema
>["params"];
export type UpdateExerciseBody = z.infer<typeof updateExerciseSchema>["body"];
export type DeleteExerciseParams = z.infer<
  typeof deleteExerciseSchema
>["params"];
