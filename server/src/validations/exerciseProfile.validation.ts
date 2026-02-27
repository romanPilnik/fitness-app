import { z } from "zod";

export const getExerciseProfiles = z.object({
  query: z.object({
    isFavorite: z.coerce.boolean().optional(),
    needsFormCheck: z.coerce.boolean().optional(),
    isInjuryModified: z.coerce.boolean().optional(),
  }),
});

export const getExerciseProfileById = z.object({
  params: z.object({
    exerciseId: z.string(),
  }),
});

export const updateExerciseProfile = z.object({
  params: z.object({
    exerciseId: z.string(),
  }),
  body: z.object({
    isFavorite: z.boolean().optional(),
    needsFormCheck: z.boolean().optional(),
    isInjuryModified: z.boolean().optional(),
    difficultyRating: z.number().int().min(1).max(5).optional(),
    enjoymentRating: z.number().int().min(1).max(5).optional(),
    formNotes: z.string().max(500).optional(),
    injuryNotes: z.string().max(500).optional(),
  }),
});

export type GetExerciseProfilesInput = z.infer<typeof getExerciseProfiles>;
export type GetExerciseProfileByIdInput = z.infer<
  typeof getExerciseProfileById
>;
export type UpdateExerciseProfileInput = z.infer<typeof updateExerciseProfile>;
