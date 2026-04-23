import type { AiUserPreferences } from "@/validations/aiUserPreferences.js";
import type { Units, WeekStartsOn } from "@/generated/prisma/enums";

export interface UpdateUserDTO {
  id: string;
  name?: string;
  units?: Units;
  weekStartsOn?: WeekStartsOn;
}

export interface PatchAiPreferencesDTO {
  id: string;
  patch: Partial<AiUserPreferences>;
}
