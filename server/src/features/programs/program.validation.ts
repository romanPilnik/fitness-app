import { z } from "zod";
import {
  ProgramStatuses,
  Difficulty,
  Goal,
  SplitType,
  ProgramSources,
} from "@/generated/prisma/enums.js";
import { cursorPaginationSchema } from "@/lib/pagination.js";

export const getProgramsSchema = z.object({
  query: z
    .object({
      status: z.enum(ProgramStatuses).optional(),
      difficulty: z.enum(Difficulty).optional(),
      goal: z.enum(Goal).optional(),
      splitType: z.enum(SplitType).optional(),
      createdFrom: z.enum(ProgramSources).optional(),
    })
    .extend(cursorPaginationSchema.shape),
});

export const getProgramByIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const programWorkoutExerciseSchema = z.object({
  exerciseId: z.string(),
  order: z.number().int().min(1),
  targetSets: z.number().int().min(1),
  targetWeight: z.number().optional(),
  targetTotalReps: z.number().int().optional(),
  targetTopSetReps: z.number().int().optional(),
  targetRir: z.number().int().optional(),
});

const programWorkoutSchema = z.object({
  name: z.string().max(50).trim(),
  dayNumber: z.number().int().min(1).max(14),
  exercises: z.array(programWorkoutExerciseSchema).min(1),
});

export const createFromTemplateSchema = z.object({
  body: z.object({
    templateId: z.string(),
    name: z.string().max(50).trim().optional(),
    startDate: z.iso.datetime().optional(),
  }),
});

export const createCustomProgramSchema = z.object({
  body: z.object({
    name: z.string().max(50).trim(),
    description: z.string().max(500).optional(),
    difficulty: z.enum(Difficulty),
    goal: z.enum(Goal),
    splitType: z.enum(SplitType),
    daysPerWeek: z.number().int().min(1).max(14),
    startDate: z.iso.datetime().optional(),
    workouts: z.array(programWorkoutSchema).min(1),
  }),
});

export const updateProgramSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z
    .object({
      name: z.string().max(50).trim().optional(),
      description: z.string().max(500).optional(),
      difficulty: z.enum(Difficulty).optional(),
      goal: z.enum(Goal).optional(),
      splitType: z.enum(SplitType).optional(),
      daysPerWeek: z.number().int().min(1).max(14).optional(),
      status: z.enum(ProgramStatuses).optional(),
      startDate: z.iso.datetime().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    }),
});

export const deleteProgramSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const addProgramWorkoutSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().max(50).trim(),
    dayNumber: z.number().int().min(1).max(14),
  }),
});

export const updateProgramWorkoutSchema = z.object({
  params: z.object({
    id: z.string(),
    workoutId: z.string(),
  }),
  body: z
    .object({
      name: z.string().max(50).trim().optional(),
      dayNumber: z.number().int().min(1).max(14).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    }),
});

export const deleteProgramWorkoutSchema = z.object({
  params: z.object({
    id: z.string(),
    workoutId: z.string(),
  }),
});

export const addWorkoutExerciseSchema = z.object({
  params: z.object({
    id: z.string(),
    workoutId: z.string(),
  }),
  body: programWorkoutExerciseSchema,
});

export const updateWorkoutExerciseSchema = z.object({
  params: z.object({
    id: z.string(),
    workoutId: z.string(),
    exerciseId: z.string(),
  }),
  body: z
    .object({
      order: z.number().int().min(1).optional(),
      targetSets: z.number().int().min(1).optional(),
      targetWeight: z.number().optional(),
      targetTotalReps: z.number().int().optional(),
      targetTopSetReps: z.number().int().optional(),
      targetRir: z.number().int().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    }),
});

export const deleteWorkoutExerciseSchema = z.object({
  params: z.object({
    id: z.string(),
    workoutId: z.string(),
    exerciseId: z.string(),
  }),
});

export const bulkReorderWorkoutExercisesSchema = z.object({
  params: z.object({
    id: z.string(),
    workoutId: z.string(),
  }),
  body: z.object({
    exercises: z
      .array(z.object({ id: z.string(), order: z.number().int().min(1) }))
      .min(1),
  }),
});

export type GetProgramsQuery = z.infer<typeof getProgramsSchema>["query"];
export type GetProgramByIdParams = z.infer<
  typeof getProgramByIdSchema
>["params"];
export type CreateFromTemplateBody = z.infer<
  typeof createFromTemplateSchema
>["body"];
export type CreateCustomProgramBody = z.infer<
  typeof createCustomProgramSchema
>["body"];
export type UpdateProgramParams = z.infer<typeof updateProgramSchema>["params"];
export type UpdateProgramBody = z.infer<typeof updateProgramSchema>["body"];
export type DeleteProgramParams = z.infer<typeof deleteProgramSchema>["params"];
export type AddProgramWorkoutParams = z.infer<
  typeof addProgramWorkoutSchema
>["params"];
export type AddProgramWorkoutBody = z.infer<
  typeof addProgramWorkoutSchema
>["body"];
export type UpdateProgramWorkoutParams = z.infer<
  typeof updateProgramWorkoutSchema
>["params"];
export type UpdateProgramWorkoutBody = z.infer<
  typeof updateProgramWorkoutSchema
>["body"];
export type DeleteProgramWorkoutParams = z.infer<
  typeof deleteProgramWorkoutSchema
>["params"];
export type AddWorkoutExerciseParams = z.infer<
  typeof addWorkoutExerciseSchema
>["params"];
export type AddWorkoutExerciseBody = z.infer<
  typeof addWorkoutExerciseSchema
>["body"];
export type UpdateWorkoutExerciseParams = z.infer<
  typeof updateWorkoutExerciseSchema
>["params"];
export type UpdateWorkoutExerciseBody = z.infer<
  typeof updateWorkoutExerciseSchema
>["body"];
export type DeleteWorkoutExerciseParams = z.infer<
  typeof deleteWorkoutExerciseSchema
>["params"];
export type BulkReorderWorkoutExercisesParams = z.infer<
  typeof bulkReorderWorkoutExercisesSchema
>["params"];
export type BulkReorderWorkoutExercisesBody = z.infer<
  typeof bulkReorderWorkoutExercisesSchema
>["body"];
