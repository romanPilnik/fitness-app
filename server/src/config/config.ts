import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

function parseEnvBoolean(value: string | undefined): boolean {
  if (value === undefined) return false;
  const v = value.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

const socketCorsOrigin =
  [process.env.SOCKET_CORS_ORIGIN, process.env.CLIENT_ORIGIN]
    .map((s) => s?.trim())
    .find((s) => s) ?? "http://localhost:5173";

const aiGenerationEnabled = parseEnvBoolean(process.env.AI_GENERATION_ENABLED);

const aiEnabledSchema = z.object({
  AI_PROVIDER: z.enum(["openai"], {
    error: () => ({ message: "AI_PROVIDER must be 'openai' when AI_GENERATION_ENABLED is true" }),
  }),
  AI_API_KEY: z
    .string()
    .trim()
    .min(1, "AI_API_KEY is required when AI_GENERATION_ENABLED is true"),
  AI_MODEL: z
    .string()
    .trim()
    .min(1, "AI_MODEL must be non-empty when AI_GENERATION_ENABLED is true"),
  AI_MAX_TOKENS: z.coerce.number().int().positive(),
  AI_TEMPERATURE: z.coerce.number().min(0).max(2),
});

interface ConfigBase {
  port: number;
  portLabel: string;
  databaseUrl: string;
  nodeEnv: string;
  socketCorsOrigin: string;
}

export type Config =
  | (ConfigBase & {
      aiGenerationEnabled: true;
      aiProvider: "openai";
      aiApiKey: string;
      aiModel: string;
      aiMaxTokens: number;
      aiTemperature: number;
    })
  | (ConfigBase & { aiGenerationEnabled: false });

const parsedPort = Number(process.env.PORT ?? 5001);
const port = Number.isFinite(parsedPort) ? parsedPort : 5001;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL environment variable");
}

const base = {
  port,
  portLabel: String(port),
  databaseUrl,
  nodeEnv: process.env.NODE_ENV ?? "development",
  socketCorsOrigin,
};

let config: Config;

if (aiGenerationEnabled) {
  const modelRaw = process.env.AI_MODEL?.trim();
  const parsed = aiEnabledSchema.safeParse({
    AI_PROVIDER: process.env.AI_PROVIDER,
    AI_API_KEY: process.env.AI_API_KEY,
    AI_MODEL: modelRaw?.length ? modelRaw : "gpt-4o-mini",
    AI_MAX_TOKENS: process.env.AI_MAX_TOKENS ?? "2048",
    AI_TEMPERATURE: process.env.AI_TEMPERATURE ?? "0.3",
  });

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid AI configuration when AI_GENERATION_ENABLED is true",
    );
  }

  const { AI_API_KEY, AI_MODEL, AI_MAX_TOKENS, AI_TEMPERATURE } = parsed.data;
  config = {
    ...base,
    aiGenerationEnabled: true,
    aiProvider: "openai",
    aiApiKey: AI_API_KEY,
    aiModel: AI_MODEL,
    aiMaxTokens: AI_MAX_TOKENS,
    aiTemperature: AI_TEMPERATURE,
  };
} else {
  config = {
    ...base,
    aiGenerationEnabled: false,
  };
}

export default config;
