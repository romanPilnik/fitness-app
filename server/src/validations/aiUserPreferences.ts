import { z } from "zod";

export const progressionStyleSchema = z.enum(["conservative", "moderate", "aggressive"]);
export const progressionPreferenceSchema = z.enum(["weight", "reps", "balanced"]);
export const deloadSensitivitySchema = z.enum(["low", "medium", "high"]);

export const aiUserPreferencesSchema = z.object({
  progressionStyle: progressionStyleSchema,
  progressionPreference: progressionPreferenceSchema,
  deloadSensitivity: deloadSensitivitySchema,
  rirFloor: z.number().int().min(0).max(4),
});

export type AiUserPreferences = z.infer<typeof aiUserPreferencesSchema>;

export const DEFAULT_AI_PREFERENCES: AiUserPreferences = {
  progressionStyle: "moderate",
  progressionPreference: "balanced",
  deloadSensitivity: "medium",
  rirFloor: 2,
};

export function parseAiUserPreferences(value: unknown): AiUserPreferences {
  return aiUserPreferencesSchema.parse(value);
}

export function normalizeAiUserPreferences(raw: unknown): AiUserPreferences {
  if (raw === null || raw === undefined) {
    return DEFAULT_AI_PREFERENCES;
  }
  if (typeof raw !== "object" || Array.isArray(raw)) {
    return DEFAULT_AI_PREFERENCES;
  }
  const merged = { ...DEFAULT_AI_PREFERENCES, ...(raw as Record<string, unknown>) };
  const parsed = aiUserPreferencesSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_AI_PREFERENCES;
}

export function mergeAiUserPreferencesPatch(
  current: AiUserPreferences,
  patch: Partial<AiUserPreferences>,
): AiUserPreferences {
  return aiUserPreferencesSchema.parse({ ...current, ...patch });
}
