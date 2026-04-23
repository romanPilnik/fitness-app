import { describe, expect, it, vi } from "vitest";
import { AiProviderError, type AiStructuredResult } from "../ai/types.js";
import type { BusinessValidationError } from "../workoutGeneration.businessValidation.js";
import { executeWithRetry } from "../workoutGeneration.retry.js";
import type { AiWorkoutGenerationOutput } from "../workoutGeneration.validation.js";

function makeResult(
  overrides?: Partial<AiStructuredResult<AiWorkoutGenerationOutput>>,
): AiStructuredResult<AiWorkoutGenerationOutput> {
  return {
    data: {
      exercises: [
        {
          exerciseId: "ex1",
          targetSets: 3,
          targetRir: 2,
          notes: null,
          sets: [
            { setNumber: 1, targetWeight: 60, targetReps: 8, targetRir: 2 },
            { setNumber: 2, targetWeight: 60, targetReps: 8, targetRir: 2 },
            { setNumber: 3, targetWeight: 60, targetReps: 8, targetRir: 2 },
          ],
        },
      ],
    },
    usage: { inputTokens: 100, outputTokens: 50 },
    ...overrides,
  };
}

describe("executeWithRetry", () => {
  it("returns on first attempt when validation passes", async () => {
    const callAi = vi.fn().mockResolvedValue(makeResult());
    const validate = vi.fn().mockReturnValue([]);

    const result = await executeWithRetry({ callAi, validate });

    expect(callAi).toHaveBeenCalledTimes(1);
    expect(callAi).toHaveBeenCalledWith(undefined);
    expect(result.attempts).toBe(1);
    expect(result.data.exercises).toHaveLength(1);
    expect(result.usage.inputTokens).toBe(100);
  });

  it("retries on validation failure and succeeds", async () => {
    const validationError: BusinessValidationError = {
      field: "exercises[0].sets[0].targetWeight",
      rule: "WEIGHT_JUMP_TOO_LARGE",
      message: "Weight too high",
    };

    const callAi = vi
      .fn()
      .mockResolvedValueOnce(makeResult())
      .mockResolvedValueOnce(makeResult());

    const validate = vi
      .fn()
      .mockReturnValueOnce([validationError])
      .mockReturnValueOnce([]);

    const onStatusChange = vi.fn();
    const result = await executeWithRetry({ callAi, validate, onStatusChange });

    expect(callAi).toHaveBeenCalledTimes(2);
    const secondCall = callAi.mock.calls[1];
    expect(secondCall).toBeDefined();
    if (!secondCall) {
      return;
    }
    expect(String(secondCall[0] ?? "")).toContain("WEIGHT_JUMP_TOO_LARGE");
    expect(result.attempts).toBe(2);
    expect(result.usage.inputTokens).toBe(200);
    expect(result.usage.outputTokens).toBe(100);
    expect(onStatusChange).toHaveBeenCalledWith("retrying");
  });

  it("throws after max retries exhausted", async () => {
    const validationError: BusinessValidationError = {
      field: "exercises",
      rule: "MISSING_EXERCISE",
      message: "Missing exercise",
    };

    const callAi = vi.fn().mockResolvedValue(makeResult());
    const validate = vi.fn().mockReturnValue([validationError]);

    await expect(
      executeWithRetry({ callAi, validate, maxRetries: 1 }),
    ).rejects.toThrow(AiProviderError);

    expect(callAi).toHaveBeenCalledTimes(2);
  });

  it("does not retry permanent AI provider errors", async () => {
    const callAi = vi
      .fn()
      .mockRejectedValue(new AiProviderError("AUTH", "Unauthorized"));

    await expect(
      executeWithRetry({ callAi, validate: () => [] }),
    ).rejects.toThrow(AiProviderError);

    expect(callAi).toHaveBeenCalledTimes(1);
  });

  it("retries rate limit errors with backoff", async () => {
    const callAi = vi
      .fn()
      .mockRejectedValueOnce(new AiProviderError("RATE_LIMIT", "Rate limited"))
      .mockResolvedValueOnce(makeResult());

    const result = await executeWithRetry({ callAi, validate: () => [] });

    expect(callAi).toHaveBeenCalledTimes(2);
    expect(result.attempts).toBe(2);
  });

  it("retries MALFORMED_RESPONSE with feedback", async () => {
    const callAi = vi
      .fn()
      .mockRejectedValueOnce(new AiProviderError("MALFORMED_RESPONSE", "Bad JSON"))
      .mockResolvedValueOnce(makeResult());

    const result = await executeWithRetry({ callAi, validate: () => [] });

    expect(callAi).toHaveBeenCalledTimes(2);
    const secondCall = callAi.mock.calls[1];
    expect(secondCall).toBeDefined();
    if (!secondCall) {
      return;
    }
    expect(String(secondCall[0] ?? "")).toContain("malformed");
    expect(result.attempts).toBe(2);
  });

  it("accumulates token usage across retries", async () => {
    const callAi = vi
      .fn()
      .mockResolvedValueOnce(makeResult({ usage: { inputTokens: 100, outputTokens: 50 } }))
      .mockResolvedValueOnce(makeResult({ usage: { inputTokens: 120, outputTokens: 60 } }));

    const validate = vi
      .fn()
      .mockReturnValueOnce([{ field: "x", rule: "X", message: "bad" }])
      .mockReturnValueOnce([]);

    const result = await executeWithRetry({ callAi, validate });

    expect(result.usage.inputTokens).toBe(220);
    expect(result.usage.outputTokens).toBe(110);
  });

  it("propagates non-AiProviderError exceptions", async () => {
    const callAi = vi.fn().mockRejectedValue(new Error("Network down"));

    await expect(
      executeWithRetry({ callAi, validate: () => [] }),
    ).rejects.toThrow("Network down");

    expect(callAi).toHaveBeenCalledTimes(1);
  });
});
