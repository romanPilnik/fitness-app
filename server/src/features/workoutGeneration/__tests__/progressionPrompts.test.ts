import { describe, expect, it } from "vitest";

import {
  Equipment,
  ExerciseCategory,
  MovementPattern,
  MuscleGroup,
  SessionStatuses,
  Units,
} from "@/generated/prisma/enums.js";

import {
  DEFAULT_AI_PREFERENCES,
  preferencesToPromptSection,
  type AiUserPreferences,
} from "../prompts/aiPreferences.js";
import { buildUserPrompt, selectHistorySessions } from "../prompts/buildUserPrompt.js";
import { buildProgressionPrompt } from "../prompts/buildProgressionPrompt.js";
import { formatWeightForPrompt, kgToDisplayWeight } from "../prompts/formatWeights.js";
import type { BuildUserPromptInput, ProgramWorkoutHistorySession } from "../prompts/progressionPromptTypes.js";
import { OUTPUT_CONTRACT } from "../prompts/systemPrompt.js";

describe("formatWeights", () => {
  it("keeps kg for metric", () => {
    expect(kgToDisplayWeight(100, Units.metric)).toBe(100);
    expect(formatWeightForPrompt(100, Units.metric)).toBe("100 kg");
  });

  it("converts to lb for imperial display", () => {
    expect(kgToDisplayWeight(100, Units.imperial)).toBeCloseTo(220.46226218, 5);
    expect(formatWeightForPrompt(100, Units.imperial)).toMatch(/^220\.5 lb$/);
  });
});

describe("preferencesToPromptSection", () => {
  it("includes RIR floor and progression copy for defaults", () => {
    const text = preferencesToPromptSection(DEFAULT_AI_PREFERENCES);
    expect(text).toContain("RIR floor");
    expect(text).toContain("2");
    expect(text).toContain("moderate");
  });

  it("reflects aggressive style", () => {
    const prefs: AiUserPreferences = { ...DEFAULT_AI_PREFERENCES, progressionStyle: "aggressive" };
    expect(preferencesToPromptSection(prefs)).toContain("aggressive");
  });
});

describe("selectHistorySessions", () => {
  const mk = (id: string, date: string, status: SessionStatuses): ProgramWorkoutHistorySession => ({
    sessionId: id,
    datePerformed: date,
    sessionStatus: status,
    exercises: [],
  });

  it("drops skipped and caps at 5 newest", () => {
    const sessions: ProgramWorkoutHistorySession[] = [
      mk("a", "2026-01-01T12:00:00.000Z", SessionStatuses.completed),
      mk("b", "2026-01-02T12:00:00.000Z", SessionStatuses.skipped),
      mk("c", "2026-01-03T12:00:00.000Z", SessionStatuses.partially),
      mk("d", "2026-01-04T12:00:00.000Z", SessionStatuses.completed),
      mk("e", "2026-01-05T12:00:00.000Z", SessionStatuses.completed),
      mk("f", "2026-01-06T12:00:00.000Z", SessionStatuses.completed),
      mk("g", "2026-01-07T12:00:00.000Z", SessionStatuses.completed),
    ];
    const out = selectHistorySessions(sessions);
    expect(out.map((s) => s.sessionId)).toEqual(["g", "f", "e", "d", "c"]);
  });
});

describe("buildProgressionPrompt", () => {
  const baseInput: BuildUserPromptInput = {
    units: Units.metric,
    completedSession: {
      sessionId: "sess1",
      datePerformed: "2026-04-10T10:00:00.000Z",
      sessionStatus: SessionStatuses.completed,
      exercises: [
        {
          exerciseId: "ex1",
          order: 0,
          targetSets: 3,
          targetWeightKg: 60,
          targetTotalReps: null,
          targetTopSetReps: 8,
          targetRir: 2,
          sets: [
            {
              setNumber: 1,
              weightKg: 60,
              reps: 8,
              rir: 2,
              setCompleted: true,
            },
          ],
        },
      ],
    },
    exerciseContexts: [
      {
        order: 0,
        exerciseId: "ex1",
        name: "Bench Press",
        category: ExerciseCategory.compound,
        equipment: Equipment.barbell,
        movementPattern: MovementPattern.horizontal_push,
        primaryMuscle: MuscleGroup.chest,
        secondaryMuscles: [MuscleGroup.triceps],
      },
    ],
    programWorkoutTargets: [
      {
        exerciseId: "ex1",
        order: 0,
        targetSets: 3,
        targetWeightKg: 60,
        targetTotalReps: null,
        targetTopSetReps: 8,
        targetRir: 2,
        notes: null,
      },
    ],
    previousGeneratedTargets: null,
    historySessions: [],
  };

  it("returns system prompt with output contract themes", () => {
    const { systemPrompt, userPrompt } = buildProgressionPrompt({ ...baseInput });
    expect(systemPrompt).toContain("progressive overload");
    expect(systemPrompt).toContain("Compound lifts");
    expect(systemPrompt).toContain(OUTPUT_CONTRACT.slice(0, 40));
    expect(userPrompt.length).toBeGreaterThan(100);
    expect(userPrompt).toContain("sess1");
    expect(userPrompt).toContain("Bench Press");
  });

  it("merges custom preferences", () => {
    const { userPrompt } = buildProgressionPrompt({
      ...baseInput,
      preferences: { ...DEFAULT_AI_PREFERENCES, progressionStyle: "conservative" },
    });
    expect(userPrompt).toContain("conservative");
  });
});

describe("OUTPUT_CONTRACT vs Zod shape", () => {
  it("mentions the same field names as the workout generation schema", () => {
    const keys = [
      "exerciseId",
      "targetSets",
      "targetRir",
      "notes",
      "sets",
      "setNumber",
      "targetWeight",
      "targetReps",
    ];
    for (const k of keys) {
      expect(OUTPUT_CONTRACT).toContain(k);
    }
  });
});

describe("buildUserPrompt", () => {
  it("includes optional history trend summary when provided", () => {
    const input: BuildUserPromptInput = {
      units: Units.metric,
      completedSession: {
        sessionId: "s1",
        datePerformed: "2026-04-10T10:00:00.000Z",
        sessionStatus: SessionStatuses.completed,
        exercises: [],
      },
      exerciseContexts: [],
      programWorkoutTargets: [],
      previousGeneratedTargets: null,
      historySessions: [],
      historyTrendSummary: "Squat: missed RIR on set 3 for two weeks.",
    };
    const text = buildUserPrompt(input, DEFAULT_AI_PREFERENCES);
    expect(text).toContain("Trend and hit/miss summary");
    expect(text).toContain("missed RIR");
  });

  it("lists previous generated targets when provided", () => {
    const input: BuildUserPromptInput = {
      units: Units.metric,
      completedSession: {
        sessionId: "s1",
        datePerformed: "2026-04-10T10:00:00.000Z",
        sessionStatus: SessionStatuses.completed,
        exercises: [],
      },
      exerciseContexts: [],
      programWorkoutTargets: [],
      previousGeneratedTargets: [
        {
          exerciseId: "ex1",
          order: 0,
          targetSets: 3,
          targetRir: 2,
          notes: "prior note",
          sets: [
            { setNumber: 1, targetWeightKg: 50, targetReps: 10, targetRir: 2 },
          ],
        },
      ],
      historySessions: [],
    };
    const text = buildUserPrompt(input, DEFAULT_AI_PREFERENCES);
    expect(text).toContain("Previous AI-generated targets");
    expect(text).toContain("prior note");
    expect(text).toContain("50 kg");
  });
});
