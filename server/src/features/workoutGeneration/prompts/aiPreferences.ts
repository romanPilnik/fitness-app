import type { AiUserPreferences } from "@/validations/aiUserPreferences.js";

export type { AiUserPreferences };
export {
  aiUserPreferencesSchema,
  DEFAULT_AI_PREFERENCES,
  deloadSensitivitySchema,
  mergeAiUserPreferencesPatch,
  normalizeAiUserPreferences,
  parseAiUserPreferences,
  progressionPreferenceSchema,
  progressionStyleSchema,
} from "@/validations/aiUserPreferences.js";

export function preferencesToPromptSection(prefs: AiUserPreferences): string {
  const lines: string[] = ["## User progression preferences", ""];

  lines.push(
    progressionStyleInstruction(prefs.progressionStyle),
    "",
    progressionPreferenceInstruction(prefs.progressionPreference),
    "",
    deloadSensitivityInstruction(prefs.deloadSensitivity),
    "",
    `**RIR floor:** Prescribe at least RIR ${String(prefs.rirFloor)} on working sets unless a specific set is explicitly a top set or AMRAP; never prescribe below this floor for standard working sets.`,
  );

  return lines.join("\n");
}

function progressionStyleInstruction(style: AiUserPreferences["progressionStyle"]): string {
  switch (style) {
    case "conservative":
      return "**Progression style (conservative):** Prefer small, infrequent load jumps (roughly 1–2.5 kg / 2.5–5 lb on barbell work where appropriate). Add reps before weight when in doubt. Avoid large jumps in weight and reps in the same week.";
    case "moderate":
      return "**Progression style (moderate):** Use standard progressive overload: when the user hits targets with solid form, increase load slightly or add a rep on one set. Do not increase weight and total reps aggressively at the same time.";
    case "aggressive":
      return "**Progression style (aggressive):** The user accepts faster progression. When performance clearly exceeds targets, you may increase load more assertively, but still avoid simultaneous large jumps in weight and volume. Safety and technique come first.";
    default: {
      const _exhaustive: never = style;
      return _exhaustive;
    }
  }
}

function progressionPreferenceInstruction(
  pref: AiUserPreferences["progressionPreference"],
): string {
  switch (pref) {
    case "weight":
      return "**Load vs reps:** Prefer adding weight first when targets are met; use rep progression mainly when a weight jump is not practical (e.g. dumbbells, machines with fixed stacks).";
    case "reps":
      return "**Load vs reps:** Prefer adding reps within the target rep range before increasing weight, especially on isolation and machine movements.";
    case "balanced":
      return "**Load vs reps:** Balance weight and rep progression based on exercise type: favor small load steps on compounds, and rep or load on isolation as appropriate.";
    default: {
      const _exhaustive: never = pref;
      return _exhaustive;
    }
  }
}

function deloadSensitivityInstruction(s: AiUserPreferences["deloadSensitivity"]): string {
  switch (s) {
    case "low":
      return "**Deload sensitivity (low):** Do not suggest a deload unless performance is clearly degraded across multiple recent sessions or the user missed targets badly.";
    case "medium":
      return "**Deload sensitivity (medium):** Consider a modest pullback or extra recovery set if targets are missed on several sets or across two consecutive sessions for the same lift.";
    case "high":
      return "**Deload sensitivity (high):** If targets are missed or RIR was lower than prescribed, bias toward reduced load, fewer hard sets, or a short recovery-oriented prescription before pushing again.";
    default: {
      const _exhaustive: never = s;
      return _exhaustive;
    }
  }
}
