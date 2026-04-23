import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { NotFoundError } from "@/errors/index";
import config from "@/config/config";
import { GeneratedWorkoutStatus } from "@/generated/prisma/enums.js";
import { prisma } from "@/lib/prisma";
import { getIo } from "@/lib/socket";
import type {
  GenerationErrorPayload,
  GenerationResultPayload,
  GenerationStatusPayload,
} from "@/socket/generationEvents.js";
import { ERROR_CODES } from "@/types/error.types";
import logger from "@/utils/logger";
import { normalizeAiUserPreferences } from "@/validations/aiUserPreferences.js";
import { createAiProvider } from "./ai/createAiProvider.js";
import { AiProviderError } from "./ai/types.js";
import { buildProgressionPrompt } from "./prompts/buildProgressionPrompt.js";
import {
  validateAiOutputBusinessRules,
  type BusinessValidationContext,
} from "./workoutGeneration.businessValidation.js";
import {
  buildGeneratedWorkoutCreateArgs,
  buildUserPromptInputFromContext,
  loadWorkoutGenerationContext,
  orderAiExercisesLikeProgram,
} from "./workoutGeneration.helpers.js";
import { executeWithRetry } from "./workoutGeneration.retry.js";
import {
  aiWorkoutGenerationOutputSchema,
  type AiWorkoutGenerationOutput,
} from "./workoutGeneration.validation.js";

function emitToUser(userId: string, event: string, payload: unknown): void {
  const io = getIo();
  if (!io) {
    logger.warn({ userId, event }, "Socket.IO server not available; skipped emit");
    return;
  }
  io.to(`user:${userId}`).emit(event, payload);
}

function emitStatus(userId: string, status: GenerationStatusPayload["status"]): void {
  emitToUser(userId, "generation:status", { status } satisfies GenerationStatusPayload);
}

function emitResult(userId: string, payload: GenerationResultPayload): void {
  emitToUser(userId, "generation:result", payload);
}

function emitError(userId: string, payload: GenerationErrorPayload): void {
  emitToUser(userId, "generation:error", payload);
}

function getAiProviderNonNull() {
  if (!config.aiGenerationEnabled) {
    throw new AiProviderError("BAD_REQUEST", "AI generation is disabled");
  }
  const provider = createAiProvider(config);
  if (!provider) {
    throw new AiProviderError("UNKNOWN", "AI provider could not be created");
  }
  return provider;
}

async function createFailedGenerationRecord(input: {
  userId: string;
  programId: string;
  programWorkoutId: string;
  triggerSessionId: string;
  aiProvider: string;
  aiModel: string;
}): Promise<void> {
  await prisma.generatedWorkout.create({
    data: {
      userId: input.userId,
      programId: input.programId,
      programWorkoutId: input.programWorkoutId,
      triggerSessionId: input.triggerSessionId,
      aiProvider: input.aiProvider,
      aiModel: input.aiModel,
      status: GeneratedWorkoutStatus.failed,
    },
  });
}

async function tryCreateFailedGenerationRecord(
  input: Parameters<typeof createFailedGenerationRecord>[0],
  sessionId: string,
  logLabel: string,
): Promise<void> {
  try {
    await createFailedGenerationRecord(input);
  } catch (persistErr) {
    if (
      persistErr instanceof PrismaClientKnownRequestError &&
      persistErr.code === "P2002"
    ) {
      logger.debug({ userId: input.userId, sessionId }, `${logLabel} (race)`);
    } else {
      throw persistErr;
    }
  }
}

function extractPreviousWeights(
  ctx: Awaited<ReturnType<typeof loadWorkoutGenerationContext>>,
): Map<string, number> {
  const weights = new Map<string, number>();

  if (ctx.previousCompletedGeneration) {
    for (const ex of ctx.previousCompletedGeneration.exercises) {
      const maxWeight = Math.max(...ex.sets.map((s) => s.targetWeight), 0);
      if (maxWeight > 0) weights.set(ex.exerciseId, maxWeight);
    }
    return weights;
  }

  if (ctx.historySessions.length > 0) {
    const latest = ctx.historySessions[0];
    if (latest === undefined) {
      return weights;
    }
    for (const ex of latest.exercises) {
      const maxWeight = Math.max(...ex.sets.map((s) => s.weightKg), 0);
      if (maxWeight > 0) weights.set(ex.exerciseId, maxWeight);
    }
  }

  return weights;
}

export interface RunWorkoutGenerationArgs {
  userId: string;
  sessionId: string;
}

export async function runWorkoutGeneration(args: RunWorkoutGenerationArgs): Promise<void> {
  const { userId, sessionId } = args;

  if (!config.aiGenerationEnabled) {
    emitStatus(userId, "failed");
    emitError(userId, { message: "AI generation is disabled", code: "AI_DISABLED" });
    return;
  }

  let ctx: Awaited<ReturnType<typeof loadWorkoutGenerationContext>>;
  try {
    ctx = await loadWorkoutGenerationContext(sessionId, userId);
  } catch (e) {
    if (e instanceof NotFoundError) {
      emitStatus(userId, "failed");
      emitError(userId, {
        message: e.message,
        code: e.code === ERROR_CODES.SESSION_NOT_FOUND ? "SESSION_NOT_FOUND" : "NOT_FOUND",
      });
      return;
    }
    throw e;
  }

  emitStatus(userId, "gathering_data");

  const { session, programWorkout } = ctx;
  const programId = session.programId;
  const programWorkoutId = programWorkout.id;

  const programExerciseIdsOrdered = programWorkout.programWorkoutExercises.map((p) => p.exerciseId);
  const orderByExerciseId = new Map(
    programWorkout.programWorkoutExercises.map((p) => [p.exerciseId, p.order] as const),
  );

  const existing = await prisma.generatedWorkout.findUnique({
    where: { triggerSessionId: sessionId },
  });

  if (existing !== null) {
    if (existing.status === GeneratedWorkoutStatus.completed) {
      emitStatus(userId, "complete");
      emitResult(userId, {
        generatedWorkoutId: existing.id,
        summary: summaryForProgramWorkout(programWorkout.name),
      });
      return;
    }
    await prisma.generatedWorkout.delete({ where: { id: existing.id } });
  }

  const userPromptInput = buildUserPromptInputFromContext(ctx);
  const preferences = normalizeAiUserPreferences(ctx.user.aiConfig);
  const { systemPrompt, userPrompt } = buildProgressionPrompt({
    ...userPromptInput,
    preferences,
  });

  logger.debug(
    { userId, sessionId, systemPromptLength: systemPrompt.length, userPromptLength: userPrompt.length, exerciseCount: programExerciseIdsOrdered.length },
    "AI generation request",
  );

  emitStatus(userId, "generating");

  const failRecordInput = {
    userId,
    programId,
    programWorkoutId,
    triggerSessionId: sessionId,
    aiProvider: config.aiProvider,
    aiModel: config.aiModel,
  };

  const previousWeightsByExercise = extractPreviousWeights(ctx);
  const validationContext: BusinessValidationContext = {
    programExerciseIds: programExerciseIdsOrdered,
    previousWeightsByExercise,
  };

  let retryResult: Awaited<ReturnType<typeof executeWithRetry>>;
  try {
    const provider = getAiProviderNonNull();
    retryResult = await executeWithRetry({
      callAi: (retryFeedback) => {
        const finalUserPrompt = retryFeedback
          ? `${userPrompt}\n\n---\n\n${retryFeedback}`
          : userPrompt;

        logger.debug({ userId, sessionId, hasRetryFeedback: !!retryFeedback }, "calling AI provider");

        return provider.completeStructured({
          systemPrompt,
          userPrompt: finalUserPrompt,
          schema: aiWorkoutGenerationOutputSchema,
          structuredOutputName: "workout_generation_output",
        });
      },
      validate: (data) => validateAiOutputBusinessRules(data, validationContext),
      onStatusChange: (status) => {
        emitStatus(userId, status);
      },
    });
  } catch (e) {
    logger.warn({ err: e, userId, sessionId }, "workout generation AI call failed");
    await tryCreateFailedGenerationRecord(failRecordInput, sessionId, "duplicate generation row on failure");
    emitStatus(userId, "failed");
    const message =
      e instanceof AiProviderError
        ? "Generation service temporarily unavailable"
        : "Could not generate valid targets, please try again";
    emitError(userId, {
      message,
      code: e instanceof AiProviderError ? "AI_PROVIDER_ERROR" : "GENERATION_FAILED",
    });
    return;
  }

  logger.debug(
    { userId, sessionId, usage: retryResult.usage, responseExerciseCount: retryResult.data.exercises.length },
    "AI generation response",
  );

  emitStatus(userId, "validating");

  let exercisesOrdered: AiWorkoutGenerationOutput["exercises"];
  try {
    exercisesOrdered = orderAiExercisesLikeProgram(programExerciseIdsOrdered, retryResult.data);
  } catch (e) {
    logger.warn({ err: e, userId, sessionId }, "workout generation output did not match program");
    await tryCreateFailedGenerationRecord(failRecordInput, sessionId, "duplicate generation row on validation failure");
    emitStatus(userId, "failed");
    emitError(userId, {
      message: "Could not generate valid targets, please try again",
      code: "VALIDATION_FAILED",
    });
    return;
  }

  emitStatus(userId, "saving");

  const createData = buildGeneratedWorkoutCreateArgs({
    userId,
    programId,
    programWorkoutId,
    triggerSessionId: sessionId,
    aiProvider: config.aiProvider,
    aiModel: config.aiModel,
    status: GeneratedWorkoutStatus.completed,
    exercisesOrdered,
    orderByExerciseId,
    tokenInput: retryResult.usage.inputTokens,
    tokenOutput: retryResult.usage.outputTokens,
    retryCount: retryResult.attempts - 1,
    latencyMs: retryResult.latencyMs,
  });

  let generatedWorkoutId: string;
  try {
    const created = await prisma.generatedWorkout.create({ data: createData });
    generatedWorkoutId = created.id;
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError && e.code === "P2002") {
      const row = await prisma.generatedWorkout.findUnique({
        where: { triggerSessionId: sessionId },
      });
      if (row?.status === GeneratedWorkoutStatus.completed) {
        emitStatus(userId, "complete");
        emitResult(userId, {
          generatedWorkoutId: row.id,
          summary: summaryForProgramWorkout(programWorkout.name),
        });
        return;
      }
    }
    logger.error({ err: e, userId, sessionId }, "workout generation persist failed");
    emitStatus(userId, "failed");
    emitError(userId, { message: "Could not save generated targets", code: "PERSIST_FAILED" });
    return;
  }

  logger.info(
    {
      userId,
      sessionId,
      generatedWorkoutId,
      latencyMs: retryResult.latencyMs,
      attempts: retryResult.attempts,
      inputTokens: retryResult.usage.inputTokens,
      outputTokens: retryResult.usage.outputTokens,
      provider: config.aiProvider,
      model: config.aiModel,
    },
    "workout generation completed",
  );

  emitStatus(userId, "complete");
  emitResult(userId, {
    generatedWorkoutId,
    summary: summaryForProgramWorkout(programWorkout.name),
  });
}

function summaryForProgramWorkout(workoutName: string): string {
  return `Targets ready for ${workoutName}`;
}
