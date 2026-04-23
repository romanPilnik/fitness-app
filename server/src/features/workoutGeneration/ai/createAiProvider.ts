import OpenAI from "openai";
import type { Config } from "@/config/config.js";
import type { AiProvider } from "./aiProvider.js";
import { OpenAiProvider } from "./openaiProvider.js";

let cached: AiProvider | null = null;

export function createAiProvider(config: Config): AiProvider | null {
  if (!config.aiGenerationEnabled) {
    return null;
  }
  if (cached) {
    return cached;
  }
  const client = new OpenAI({ apiKey: config.aiApiKey });
  cached = new OpenAiProvider(client, {
    model: config.aiModel,
    maxTokens: config.aiMaxTokens,
    temperature: config.aiTemperature,
  });
  return cached;
}
