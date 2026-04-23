export type AiProviderErrorCode =
  | "RATE_LIMIT"
  | "AUTH"
  | "BAD_REQUEST"
  | "TIMEOUT"
  | "MALFORMED_RESPONSE"
  | "UNKNOWN";

export class AiProviderError extends Error {
  readonly code: AiProviderErrorCode;

  constructor(
    code: AiProviderErrorCode,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message);
    this.name = "AiProviderError";
    this.code = code;
    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

export interface AiTokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens?: number;
}

export interface AiStructuredResult<T> {
  data: T;
  usage: AiTokenUsage;
}
