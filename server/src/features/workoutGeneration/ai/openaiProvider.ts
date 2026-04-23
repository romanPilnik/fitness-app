import OpenAI, {
  APIConnectionError,
  APIConnectionTimeoutError,
  AuthenticationError,
  BadRequestError,
  PermissionDeniedError,
  RateLimitError,
  UnprocessableEntityError,
} from "openai";
import { ContentFilterFinishReasonError, LengthFinishReasonError } from "openai/error";
import { zodResponseFormat } from "openai/helpers/zod";
import { ZodError } from "zod";
import type { AiProvider, CompleteStructuredArgs } from "./aiProvider.js";
import { AiProviderError, type AiStructuredResult, type AiTokenUsage } from "./types.js";

export interface OpenAiProviderOptions {
  model: string;
  maxTokens: number;
  temperature: number;
}

function usageFromCompletion(completion: {
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | null;
}): AiTokenUsage {
  const u = completion.usage;
  if (!u) {
    return { inputTokens: 0, outputTokens: 0 };
  }
  return {
    inputTokens: u.prompt_tokens ?? 0,
    outputTokens: u.completion_tokens ?? 0,
    totalTokens: u.total_tokens,
  };
}

function mapOpenAiError(error: unknown): AiProviderError {
  if (error instanceof AiProviderError) {
    return error;
  }
  if (error instanceof ZodError) {
    return new AiProviderError("MALFORMED_RESPONSE", "Structured output failed schema validation", {
      cause: error,
    });
  }
  if (error instanceof RateLimitError) {
    return new AiProviderError("RATE_LIMIT", error.message, { cause: error });
  }
  if (error instanceof AuthenticationError || error instanceof PermissionDeniedError) {
    return new AiProviderError("AUTH", error.message, { cause: error });
  }
  if (error instanceof BadRequestError || error instanceof UnprocessableEntityError) {
    return new AiProviderError("BAD_REQUEST", error.message, { cause: error });
  }
  if (error instanceof APIConnectionTimeoutError) {
    return new AiProviderError("TIMEOUT", error.message, { cause: error });
  }
  if (error instanceof APIConnectionError) {
    return new AiProviderError("UNKNOWN", error.message, { cause: error });
  }
  if (error instanceof LengthFinishReasonError) {
    return new AiProviderError(
      "MALFORMED_RESPONSE",
      "Completion truncated before valid structured output",
      { cause: error },
    );
  }
  if (error instanceof ContentFilterFinishReasonError) {
    return new AiProviderError("BAD_REQUEST", "Response blocked by content filter", { cause: error });
  }
  if (error instanceof Error) {
    return new AiProviderError("UNKNOWN", error.message, { cause: error });
  }
  return new AiProviderError("UNKNOWN", String(error));
}

export class OpenAiProvider implements AiProvider {
  private readonly client: OpenAI;
  private readonly options: OpenAiProviderOptions;

  constructor(client: OpenAI, options: OpenAiProviderOptions) {
    this.client = client;
    this.options = options;
  }

  async completeStructured<T>(args: CompleteStructuredArgs<T>): Promise<AiStructuredResult<T>> {
    const structuredOutputName = args.structuredOutputName ?? "workout_generation_output";
    try {
      const completion = await this.client.chat.completions.parse({
        model: this.options.model,
        messages: [
          { role: "system", content: args.systemPrompt },
          { role: "user", content: args.userPrompt },
        ],
        max_completion_tokens: this.options.maxTokens,
        temperature: this.options.temperature,
        response_format: zodResponseFormat(args.schema, structuredOutputName),
      });

      const message = completion.choices[0]?.message;
      const parsed = message?.parsed;
      if (parsed === null || parsed === undefined) {
        throw new AiProviderError("MALFORMED_RESPONSE", "Model returned no parseable structured output");
      }

      const validated = args.schema.safeParse(parsed);
      if (!validated.success) {
        throw new AiProviderError("MALFORMED_RESPONSE", "Structured output failed schema validation", {
          cause: validated.error,
        });
      }

      return {
        data: validated.data,
        usage: usageFromCompletion(completion),
      };
    } catch (e) {
      throw mapOpenAiError(e);
    }
  }
}
