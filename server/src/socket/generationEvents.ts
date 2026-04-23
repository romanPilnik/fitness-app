// Keep in sync with client2/src/lib/generationEvents.ts

export type GenerationStatus =
  | "gathering_data"
  | "generating"
  | "validating"
  | "retrying"
  | "saving"
  | "complete"
  | "failed";

export type GenerationErrorCode =
  | "AI_DISABLED"
  | "SESSION_NOT_FOUND"
  | "NOT_FOUND"
  | "AI_PROVIDER_ERROR"
  | "GENERATION_FAILED"
  | "VALIDATION_FAILED"
  | "PERSIST_FAILED"
  | "INTERNAL_ERROR";

export interface GenerationStatusPayload {
  status: GenerationStatus;
}

export interface GenerationStartPayload {
  sessionId: string;
}

export interface GenerationResultPayload {
  generatedWorkoutId: string;
  summary: string;
}

export interface GenerationErrorPayload {
  message: string;
  code: GenerationErrorCode;
}
