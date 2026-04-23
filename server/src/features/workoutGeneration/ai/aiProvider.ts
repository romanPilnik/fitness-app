import type { z } from "zod";
import type { AiStructuredResult } from "./types.js";

export interface CompleteStructuredArgs<T> {
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<T>;
  structuredOutputName?: string;
}

export interface AiProvider {
  completeStructured<T>(args: CompleteStructuredArgs<T>): Promise<AiStructuredResult<T>>;
}
