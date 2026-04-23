import type { AiUserPreferences } from "./aiPreferences.js";
import { DEFAULT_AI_PREFERENCES } from "./aiPreferences.js";
import { buildUserPrompt } from "./buildUserPrompt.js";
import type { BuildUserPromptInput } from "./progressionPromptTypes.js";
import { SYSTEM_PROMPT } from "./systemPrompt.js";

export type BuildProgressionPromptInput = BuildUserPromptInput & {
  preferences?: AiUserPreferences;
};

export function buildProgressionPrompt(input: BuildProgressionPromptInput): {
  systemPrompt: string;
  userPrompt: string;
} {
  const { preferences: prefsOverride, ...userInput } = input;
  const preferences = prefsOverride ?? DEFAULT_AI_PREFERENCES;
  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: buildUserPrompt(userInput, preferences),
  };
}
