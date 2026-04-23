import { z } from "zod";
import {
  ProgramStatuses,
  Difficulty,
  Goal,
  SplitType,
  ProgramSources,
  ProgramScheduleKind,
} from "@/generated/prisma/enums.js";
import { cursorPaginationSchema } from "@/lib/pagination.js";
import { programListSortValues } from "./program.dtos.js";

export const getProgramsSchema = z.object({
  query: z
    .object({
      status: z.enum(ProgramStatuses).optional(),
      difficulty: z.enum(Difficulty).optional(),
      goal: z.enum(Goal).optional(),
      splitType: z.enum(SplitType).optional(),
      createdFrom: z.enum(ProgramSources).optional(),
      sort: z.enum(programListSortValues).default("created_desc"),
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

const schedulePatternInputSlotSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("rest") }),
  z.object({
    type: z.literal("workout"),
    workoutIndex: z.number().int().min(0),
  }),
]);

const scheduleSlotStoredSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("rest") }),
  z.object({
    type: z.literal("workout"),
    programWorkoutId: z.string().min(1),
  }),
]);

export const createFromTemplateSchema = z.object({
  body: z.object({
    templateId: z.string(),
    name: z.string().max(50).trim().optional(),
    startDate: z.iso.datetime().optional(),
    lengthWeeks: z.number().int().min(1).max(104).optional(),
    timeZone: z.string().min(1).optional(),
  }),
});

export const createCustomProgramSchema = z.object({
  body: z
    .object({
      name: z.string().max(50).trim(),
      description: z.string().max(500).optional(),
      difficulty: z.enum(Difficulty),
      goal: z.enum(Goal),
      splitType: z.enum(SplitType),
      daysPerWeek: z.number().int().min(1).max(14),
      startDate: z.iso.datetime().optional(),
      lengthWeeks: z.number().int().min(1).max(104).optional(),
      scheduleKind: z.enum(ProgramScheduleKind),
      schedulePattern: z.array(schedulePatternInputSlotSchema).min(1),
      timeZone: z.string().min(1).optional(),
      workouts: z.array(programWorkoutSchema).min(1),
    })
    .superRefine((body, ctx) => {
      if (
        body.scheduleKind === ProgramScheduleKind.sync_week &&
        body.schedulePattern.length !== 7
      ) {
        ctx.addIssue({
          code: "custom",
          message: "sync_week schedulePattern must have exactly 7 slots",
          path: ["schedulePattern"],
        });
      }
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
      lengthWeeks: z.number().int().min(1).max(104).optional(),
      scheduleKind: z.enum(ProgramScheduleKind).optional(),
      schedulePattern: z.array(scheduleSlotStoredSchema).optional(),
      timeZone: z.string().min(1).optional(),
    })
    .superRefine((data, ctx) => {
      if (Object.keys(data).length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "At least one field must be provided",
        });
      }
      if (
        data.scheduleKind === ProgramScheduleKind.sync_week &&
        data.schedulePattern &&
        data.schedulePattern.length !== 7
      ) {
        ctx.addIssue({
          code: "custom",
          message: "sync_week schedulePattern must have exactly 7 slots",
          path: ["schedulePattern"],
        });
      }
    }),
});

export const getProgramOccurrencesSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  query: z.object({
    dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }),
});

export const getNextWorkoutSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  query: z.object({
    timeZone: z.string().min(1).optional(),
  }),
});

export const patchProgramOccurrenceSchema = z.object({
  params: z.object({
    id: z.string(),
    occurrenceId: z.string(),
  }),
  body: z
    .object({
      scheduledOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      status: z.enum(["planned", "skipped", "cancelled"]).optional(),
      timeZone: z.string().min(1).optional(),
    })
    .refine((b) => Object.keys(b).filter((k) => k !== "timeZone").length > 0, {
      message: "scheduledOn and/or status is required",
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
