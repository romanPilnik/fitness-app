import type { GenerationStatus } from "@/socket/generationEvents.js";
import { AiProviderError, type AiStructuredResult, type AiTokenUsage } from "./ai/types.js";
import type { BusinessValidationError } from "./workoutGeneration.businessValidation.js";
import type { AiWorkoutGenerationOutput } from "./workoutGeneration.validation.js";

const DEFAULT_MAX_RETRIES = 2;
const BACKOFF_BASE_MS = 1000;

export interface RetryableGenerationOptions {
  callAi: (retryFeedback?: string) => Promise<AiStructuredResult<AiWorkoutGenerationOutput>>;
  validate: (data: AiWorkoutGenerationOutput) => BusinessValidationError[];
  maxRetries?: number;
  onStatusChange?: (status: GenerationStatus) => void;
}

export interface RetryableGenerationResult {
  data: AiWorkoutGenerationOutput;
  usage: AiTokenUsage;
  attempts: number;
  latencyMs: number;
}

function accumulateUsage(total: AiTokenUsage, add: AiTokenUsage): void {
  total.inputTokens += add.inputTokens;
  total.outputTokens += add.outputTokens;
  if (total.totalTokens !== undefined || add.totalTokens !== undefined) {
    total.totalTokens = (total.totalTokens ?? 0) + (add.totalTokens ?? 0);
  }
}

function formatValidationFeedback(errors: BusinessValidationError[]): string {
  const lines = errors.map((e) => `- ${e.field}: ${e.message} (rule: ${e.rule})`);
  return `Your previous response failed validation. Fix the following issues and try again:\n${lines.join("\n")}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableProviderError(err: AiProviderError): boolean {
  return err.code === "RATE_LIMIT" || err.code === "TIMEOUT" || err.code === "MALFORMED_RESPONSE";
}

export async function executeWithRetry(
  options: RetryableGenerationOptions,
): Promise<RetryableGenerationResult> {
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const totalUsage: AiTokenUsage = { inputTokens: 0, outputTokens: 0 };
  const startMs = Date.now();
  let attempts = 0;
  let retryFeedback: string | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    attempts = attempt + 1;

    let result: AiStructuredResult<AiWorkoutGenerationOutput>;
    try {
      result = await options.callAi(retryFeedback);
    } catch (err) {
      if (err instanceof AiProviderError) {
        if (!isRetryableProviderError(err) || attempt === maxRetries) {
          throw err;
        }
        if (err.code === "RATE_LIMIT" || err.code === "TIMEOUT") {
          const backoffMs = BACKOFF_BASE_MS * 2 ** attempt;
          options.onStatusChange?.("retrying");
          await sleep(backoffMs);
          retryFeedback = undefined;
          continue;
        }
        options.onStatusChange?.("retrying");
        retryFeedback = `Previous response was malformed: ${err.message}. Return valid structured JSON.`;
        continue;
      }
      throw err;
    }

    accumulateUsage(totalUsage, result.usage);

    const validationErrors = options.validate(result.data);
    if (validationErrors.length === 0) {
      return {
        data: result.data,
        usage: totalUsage,
        attempts,
        latencyMs: Date.now() - startMs,
      };
    }

    if (attempt === maxRetries) {
      throw new AiProviderError(
        "MALFORMED_RESPONSE",
        `Business validation failed after ${String(attempts)} attempts: ${validationErrors.map((e) => e.message).join("; ")}`,
      );
    }

    options.onStatusChange?.("retrying");
    retryFeedback = formatValidationFeedback(validationErrors);
  }

  throw new AiProviderError("UNKNOWN", "Retry loop exited unexpectedly");
}
