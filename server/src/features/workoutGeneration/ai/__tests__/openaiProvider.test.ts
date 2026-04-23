import { beforeEach, describe, expect, it, vi } from "vitest";
import OpenAI, { RateLimitError } from "openai";
import type { Config } from "@/config/config.js";
import { aiWorkoutGenerationOutputSchema } from "../../workoutGeneration.validation.js";
import { createAiProvider } from "../createAiProvider.js";
import { OpenAiProvider } from "../openaiProvider.js";
import { AiProviderError } from "../types.js";

const mockParse = vi.fn();

const mockClient = {
  chat: {
    completions: {
      parse: mockParse,
    },
  },
} as unknown as OpenAI;

describe("OpenAiProvider", () => {
  const provider = new OpenAiProvider(mockClient, {
    model: "gpt-4o-mini",
    maxTokens: 1024,
    temperature: 0.3,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns parsed data and usage on success", async () => {
    mockParse.mockResolvedValue({
      choices: [
        {
          message: {
            parsed: {
              exercises: [
                {
                  exerciseId: "ex-1",
                  targetSets: 3,
                  targetRir: 2,
                  notes: null,
                  sets: [
                    { setNumber: 1, targetWeight: 60, targetReps: 8, targetRir: 2 },
                  ],
                },
              ],
            },
          },
        },
      ],
      usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
    });

    const result = await provider.completeStructured({
      systemPrompt: "sys",
      userPrompt: "user",
      schema: aiWorkoutGenerationOutputSchema,
    });

    expect(result.data.exercises).toHaveLength(1);
    expect(result.usage).toEqual({
      inputTokens: 10,
      outputTokens: 20,
      totalTokens: 30,
    });
    expect(mockParse).toHaveBeenCalledOnce();
  });

  it("throws MALFORMED_RESPONSE when parsed is null", async () => {
    mockParse.mockResolvedValue({
      choices: [{ message: { parsed: null } }],
      usage: {},
    });

    await expect(
      provider.completeStructured({
        systemPrompt: "s",
        userPrompt: "u",
        schema: aiWorkoutGenerationOutputSchema,
      }),
    ).rejects.toMatchObject({
      code: "MALFORMED_RESPONSE",
    });
  });

  it("throws MALFORMED_RESPONSE when parsed fails schema", async () => {
    mockParse.mockResolvedValue({
      choices: [
        {
          message: {
            parsed: { exercises: "not-an-array" },
          },
        },
      ],
      usage: {},
    });

    await expect(
      provider.completeStructured({
        systemPrompt: "s",
        userPrompt: "u",
        schema: aiWorkoutGenerationOutputSchema,
      }),
    ).rejects.toMatchObject({ code: "MALFORMED_RESPONSE" });
  });

  it("maps RateLimitError to RATE_LIMIT", async () => {
    mockParse.mockRejectedValue(new RateLimitError(429, undefined, "Too many requests", new Headers()));

    await expect(
      provider.completeStructured({
        systemPrompt: "s",
        userPrompt: "u",
        schema: aiWorkoutGenerationOutputSchema,
      }),
    ).rejects.toMatchObject({ code: "RATE_LIMIT" });
  });

  it("rejects are AiProviderError instances", async () => {
    mockParse.mockRejectedValue(new RateLimitError(429, undefined, "Too many requests", new Headers()));

    await provider
      .completeStructured({
        systemPrompt: "s",
        userPrompt: "u",
        schema: aiWorkoutGenerationOutputSchema,
      })
      .catch((e: unknown) => {
        expect(e).toBeInstanceOf(AiProviderError);
      });
  });
});

describe("createAiProvider", () => {
  it("returns null when AI generation is disabled", () => {
    const cfg = {
      port: 5001,
      portLabel: "5001",
      databaseUrl: "postgresql://x",
      nodeEnv: "test",
      socketCorsOrigin: "http://localhost:5173",
      aiGenerationEnabled: false,
    } satisfies Config;

    expect(createAiProvider(cfg)).toBeNull();
  });
});
