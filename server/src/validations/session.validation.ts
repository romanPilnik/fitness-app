import { z } from "zod";
import { SessionStatuses } from "../generated/prisma/enums.js";
import { cursorPaginationSchema } from "../lib/pagination.js";

const sessionExerciseSetSchema = z.object({
  targetWeight: z.number().int().min(0).optional(),
  targetReps: z.number().int().min(0).optional(),
  reps: z.number().int().min(0),
  weight: z.number().int().min(0),
  rir: z.number().int().min(0),
  setCompleted: z.boolean(),
});

const sessionExerciseSchema = z.object({
  exerciseId: z.string(),
  order: z.number().int().min(1),
  targetSets: z.number().int().min(1),
  targetWeight: z.number().int().min(0).optional(),
  targetTotalReps: z.number().int().min(0).optional(),
  targetTopSetReps: z.number().int().min(0).optional(),
  targetRir: z.number().int().min(0).optional(),
  sets: z.array(sessionExerciseSetSchema).min(1),
});

export const getSessionsSchema = z.object({
  query: z
    .object({
      sessionStatus: z.enum(SessionStatuses).optional(),
    })
    .extend(cursorPaginationSchema.shape),
});

export const getSessionByIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const createSessionSchema = z.object({
  body: z.object({
    programId: z.string(),
    workoutName: z.string().max(35).trim(),
    dayNumber: z.number().int().min(1),
    sessionStatus: z.enum(SessionStatuses),
    sessionDuration: z.number().min(0).max(600),
    exercises: z.array(sessionExerciseSchema).min(1),
  }),
});

export const deleteSessionSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export type GetSessionsQuery = z.infer<typeof getSessionsSchema>["query"];
export type GetSessionByIdParams = z.infer<
  typeof getSessionByIdSchema
>["params"];
export type CreateSessionBody = z.infer<typeof createSessionSchema>["body"];
export type DeleteSessionParams = z.infer<typeof deleteSessionSchema>["params"];
