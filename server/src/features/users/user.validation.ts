import { z } from "zod";
import { Units, WeekStartsOn } from "@/generated/prisma/enums";
import {
  deloadSensitivitySchema,
  progressionPreferenceSchema,
  progressionStyleSchema,
} from "@/validations/aiUserPreferences.js";

export const updateUser = z.object({
  body: z
    .object({
      name: z.string().min(2).max(50).trim().optional(),
      units: z.enum(Units).optional(),
      weekStartsOn: z.enum(WeekStartsOn).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    }),
});

export const patchAiPreferences = z.object({
  body: z
    .object({
      progressionStyle: progressionStyleSchema.optional(),
      progressionPreference: progressionPreferenceSchema.optional(),
      deloadSensitivity: deloadSensitivitySchema.optional(),
      rirFloor: z.number().int().min(0).max(4).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    }),
});

export type UpdateUserBody = z.infer<typeof updateUser>["body"];
export type PatchAiPreferencesBody = z.infer<typeof patchAiPreferences>["body"];
