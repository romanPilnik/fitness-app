import { beforeEach, describe, expect, it, vi } from "vitest";
import { GeneratedWorkoutStatus } from "@/generated/prisma/enums.js";

const emitMock = vi.fn();
const toMock = vi.hoisted(() =>
  vi.fn(() => ({
    emit: emitMock,
  })),
);

vi.mock("@/lib/socket.js", () => ({
  getIo: () => ({
    to: toMock,
  }),
}));

const prismaMock = vi.hoisted(() => ({
  generatedWorkout: {
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/lib/prisma.js", () => ({
  prisma: prismaMock,
}));

const loadWorkoutGenerationContextMock = vi.hoisted(() => vi.fn());

vi.mock("../workoutGeneration.helpers.js", async (importOriginal) => {
  const mod = await importOriginal<typeof import("../workoutGeneration.helpers.js")>();
  return {
    ...mod,
    loadWorkoutGenerationContext: loadWorkoutGenerationContextMock,
  };
});

vi.mock("../prompts/buildProgressionPrompt.js", () => ({
  buildProgressionPrompt: () => ({ systemPrompt: "sys", userPrompt: "user" }),
}));

const completeStructuredMock = vi.hoisted(() => vi.fn());

vi.mock("../ai/createAiProvider.js", () => ({
  createAiProvider: () => ({
    completeStructured: completeStructuredMock,
  }),
}));

vi.mock("@/config/config.js", () => ({
  default: {
    aiGenerationEnabled: true,
    aiProvider: "openai",
    aiModel: "gpt-test",
    aiApiKey: "k",
    aiMaxTokens: 2048,
    aiTemperature: 0.3,
  },
}));

import { runWorkoutGeneration } from "../workoutGeneration.service.js";

function minimalCtx() {
  return {
    session: {
      id: "sess-1",
      userId: "u-1",
      programId: "p-1",
      programWorkoutId: "pw-1",
      datePerformed: new Date("2026-01-01T12:00:00.000Z"),
      sessionStatus: "completed" as const,
      sessionExercises: [
        {
          exerciseId: "e1",
          order: 1,
          targetSets: 3,
          targetWeight: 50,
          targetTotalReps: null,
          targetTopSetReps: null,
          targetRir: 2,
          sessionExerciseSets: [
            {
              id: "ses-1",
              weight: 50,
              reps: 5,
              rir: 2,
              setCompleted: true,
            },
          ],
          exercise: {
            name: "Squat",
            category: "compound",
            equipment: "barbell",
            movementPattern: "squat",
            primaryMuscle: "quads",
            secondaryMuscles: [],
          },
        },
      ],
    },
    user: { units: "metric" as const, aiConfig: null },
    programWorkout: {
      id: "pw-1",
      name: "Push A",
      dayNumber: 1,
      programId: "p-1",
      programWorkoutExercises: [
        {
          exerciseId: "e1",
          order: 1,
          targetSets: 3,
          targetWeight: 50,
          targetTotalReps: null,
          targetTopSetReps: null,
          targetRir: 2,
          notes: null,
          exercise: {
            name: "Squat",
            category: "compound",
            equipment: "barbell",
            movementPattern: "squat",
            primaryMuscle: "quads",
            secondaryMuscles: [],
          },
        },
      ],
    },
    previousCompletedGeneration: null,
    historySessions: [],
  };
}

const aiOutput = {
  exercises: [
    {
      exerciseId: "e1",
      targetSets: 3,
      targetRir: 2,
      notes: null,
      sets: [
        { setNumber: 1, targetWeight: 52.5, targetReps: 5, targetRir: 2 },
        { setNumber: 2, targetWeight: 52.5, targetReps: 5, targetRir: 2 },
        { setNumber: 3, targetWeight: 52.5, targetReps: 5, targetRir: 2 },
      ],
    },
  ],
};

describe("runWorkoutGeneration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadWorkoutGenerationContextMock.mockResolvedValue(minimalCtx());
    prismaMock.generatedWorkout.findUnique.mockResolvedValue(null);
    completeStructuredMock.mockResolvedValue({ data: aiOutput, usage: { inputTokens: 1, outputTokens: 2 } });
    prismaMock.generatedWorkout.create.mockResolvedValue({ id: "gw-new" });
    prismaMock.generatedWorkout.delete.mockResolvedValue(undefined);
  });

  it("emits idempotent result when generation already completed", async () => {
    prismaMock.generatedWorkout.findUnique.mockResolvedValue({
      id: "gw-existing",
      status: GeneratedWorkoutStatus.completed,
    });

    await runWorkoutGeneration({ userId: "u-1", sessionId: "sess-1" });

    expect(completeStructuredMock).not.toHaveBeenCalled();
    expect(prismaMock.generatedWorkout.create).not.toHaveBeenCalled();
    expect(emitMock).toHaveBeenCalledWith(
      "generation:result",
      expect.objectContaining({
        generatedWorkoutId: "gw-existing",
        summary: "Targets ready for Push A",
      }),
    );
  });

  it("deletes failed generation row and runs again", async () => {
    prismaMock.generatedWorkout.findUnique.mockResolvedValue({
      id: "gw-fail",
      status: GeneratedWorkoutStatus.failed,
    });

    await runWorkoutGeneration({ userId: "u-1", sessionId: "sess-1" });

    expect(prismaMock.generatedWorkout.delete).toHaveBeenCalledWith({
      where: { id: "gw-fail" },
    });
    expect(completeStructuredMock).toHaveBeenCalled();
    expect(prismaMock.generatedWorkout.create).toHaveBeenCalled();
  });

  it("runs AI, persists, and emits result on success", async () => {
    await runWorkoutGeneration({ userId: "u-1", sessionId: "sess-1" });

    expect(completeStructuredMock).toHaveBeenCalled();
    expect(prismaMock.generatedWorkout.create).toHaveBeenCalled();
    expect(emitMock).toHaveBeenCalledWith(
      "generation:result",
      expect.objectContaining({
        generatedWorkoutId: "gw-new",
        summary: "Targets ready for Push A",
      }),
    );
    expect(emitMock).toHaveBeenCalledWith("generation:status", { status: "complete" });
  });

  it("emits status sequence on success", async () => {
    await runWorkoutGeneration({ userId: "u-1", sessionId: "sess-1" });

    const statusPayloads = emitMock.mock.calls
      .filter((c) => c[0] === "generation:status")
      .map((c) => c[1] as { status: string });

    expect(statusPayloads.map((s) => s.status)).toEqual([
      "gathering_data",
      "generating",
      "validating",
      "saving",
      "complete",
    ]);
  });
});
