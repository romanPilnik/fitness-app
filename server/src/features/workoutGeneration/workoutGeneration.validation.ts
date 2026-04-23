import { z } from "zod";

const generatedWorkoutExerciseSetTargetSchema = z.object({
  setNumber: z.number().int().min(1),
  targetWeight: z.number(),
  targetReps: z.number().int().min(0),
  targetRir: z.number().int().min(0).nullable().optional(),
});

export type GeneratedWorkoutExerciseSetTarget = z.infer<
  typeof generatedWorkoutExerciseSetTargetSchema
>;

const generatedWorkoutExerciseTargetSchema = z.object({
  exerciseId: z.string().min(1),
  targetSets: z.number().int().min(1),
  targetRir: z.number().int().min(0).nullable().optional(),
  notes: z.string().nullable().optional(),
  sets: z.array(generatedWorkoutExerciseSetTargetSchema).min(1),
});

export type GeneratedWorkoutExerciseTarget = z.infer<
  typeof generatedWorkoutExerciseTargetSchema
>;

export const aiWorkoutGenerationOutputSchema = z.object({
  exercises: z.array(generatedWorkoutExerciseTargetSchema).min(1),
});

export type AiWorkoutGenerationOutput = z.infer<
  typeof aiWorkoutGenerationOutputSchema
>;

export const batchGeneratedTargetsSchema = z.object({
  body: z.object({
    programWorkoutIds: z.array(z.string().min(1)).min(1).max(50),
  }),
});
