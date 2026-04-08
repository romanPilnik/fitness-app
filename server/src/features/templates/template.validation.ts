import { z } from "zod";
import { SplitType, Difficulty, Goal } from "@/generated/prisma/enums";
import { cursorPaginationSchema } from "@/lib/pagination";

export const getTemplatesSchema = z.object({
  query: z
    .object({
      splitType: z.enum(SplitType).optional(),
      myTemplatesOnly: z.coerce.boolean().optional(),
      difficulty: z.enum(Difficulty).optional(),
      daysPerWeek: z.coerce.number().int().min(1).max(14).optional(),
    })
    .extend(cursorPaginationSchema.shape),
});

export const getTemplateByIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const templateWorkoutExerciseSchema = z.object({
  exerciseId: z.string(),
  order: z.number().int().min(1),
  targetSets: z.number().int().min(1),
  targetWeight: z.number().optional(),
  targetTotalReps: z.number().int().optional(),
  targetTopSetReps: z.number().int().optional(),
  targetRir: z.number().int().optional(),
  notes: z.string().max(500).optional(),
});

const templateWorkoutSchema = z.object({
  name: z.string().max(50).trim(),
  dayNumber: z.number().int().min(1).max(14),
  exercises: z.array(templateWorkoutExerciseSchema).min(1),
});

export const createTemplateSchema = z.object({
  body: z.object({
    name: z.string().max(50).trim(),
    description: z.string().max(500).optional(),
    daysPerWeek: z.number().int().min(1).max(14),
    difficulty: z.enum(Difficulty),
    splitType: z.enum(SplitType),
    goal: z.enum(Goal),
    workouts: z.array(templateWorkoutSchema).min(1),
  }),
});

export const updateTemplateSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z
    .object({
      name: z.string().max(50).trim().optional(),
      description: z.string().max(500).optional(),
      daysPerWeek: z.number().int().min(1).max(14).optional(),
      difficulty: z.enum(Difficulty).optional(),
      splitType: z.enum(SplitType).optional(),
      goal: z.enum(Goal).optional(),
      workouts: z.array(templateWorkoutSchema).min(1).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    }),
});

export const deleteTemplateSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export type GetTemplatesQuery = z.infer<typeof getTemplatesSchema>["query"];
export type GetTemplateByIdParams = z.infer<
  typeof getTemplateByIdSchema
>["params"];
export type CreateTemplateBody = z.infer<typeof createTemplateSchema>["body"];
export type UpdateTemplateParams = z.infer<
  typeof updateTemplateSchema
>["params"];
export type UpdateTemplateBody = z.infer<typeof updateTemplateSchema>["body"];
export type DeleteTemplateParams = z.infer<
  typeof deleteTemplateSchema
>["params"];
