/**
 * Runs the real AI workout generation pipeline on synthetic sessions and prints
 * a human-readable comparison: prescribed targets, actual performance, and the
 * model's next targets.
 *
 * Requires: DATABASE_URL (config loader), AI_GENERATION_ENABLED=true, AI_API_KEY, AI_MODEL, etc.
 *
 * Usage:
 *   cd server && AI_GENERATION_ENABLED=true tsx --env-file .env src/scripts/e2eAiWorkoutGenerationDemos.ts
 */

import config from "@/config/config.js";
import {
  Equipment,
  ExerciseCategory,
  MovementPattern,
  MuscleGroup,
  SessionStatuses,
  Units,
} from "@/generated/prisma/enums.js";
import { createAiProvider } from "@/features/workoutGeneration/ai/createAiProvider.js";
import { AiProviderError } from "@/features/workoutGeneration/ai/types.js";
import { DEFAULT_AI_PREFERENCES } from "@/features/workoutGeneration/prompts/aiPreferences.js";
import { buildProgressionPrompt } from "@/features/workoutGeneration/prompts/buildProgressionPrompt.js";
import { formatWeightForPrompt } from "@/features/workoutGeneration/prompts/formatWeights.js";
import type {
  BuildUserPromptInput,
  CompletedSessionExerciseRow,
  CompletedSessionSnapshot,
  ExerciseContextRow,
  GeneratedTargetsRow,
  ProgramTargetsRow,
  ProgramWorkoutHistorySession,
} from "@/features/workoutGeneration/prompts/progressionPromptTypes.js";
import {
  validateAiOutputBusinessRules,
  type BusinessValidationContext,
} from "@/features/workoutGeneration/workoutGeneration.businessValidation.js";
import { orderAiExercisesLikeProgram } from "@/features/workoutGeneration/workoutGeneration.helpers.js";
import { executeWithRetry } from "@/features/workoutGeneration/workoutGeneration.retry.js";
import {
  aiWorkoutGenerationOutputSchema,
  type AiWorkoutGenerationOutput,
} from "@/features/workoutGeneration/workoutGeneration.validation.js";

const EX_BENCH = "demo-ex-bench";
const EX_ROW = "demo-ex-row";

const PROGRAM_EXERCISE_IDS = [EX_BENCH, EX_ROW] as const;

const ORDER_BY_ID = new Map<string, number>([
  [EX_BENCH, 1],
  [EX_ROW, 2],
]);

const EXERCISE_CONTEXTS: ExerciseContextRow[] = [
  {
    order: 1,
    exerciseId: EX_BENCH,
    name: "Barbell Bench Press",
    category: ExerciseCategory.compound,
    equipment: Equipment.barbell,
    movementPattern: MovementPattern.horizontal_push,
    primaryMuscle: MuscleGroup.chest,
    secondaryMuscles: [MuscleGroup.triceps, MuscleGroup.shoulders],
  },
  {
    order: 2,
    exerciseId: EX_ROW,
    name: "Barbell Row",
    category: ExerciseCategory.compound,
    equipment: Equipment.barbell,
    movementPattern: MovementPattern.horizontal_pull,
    primaryMuscle: MuscleGroup.back,
    secondaryMuscles: [MuscleGroup.biceps],
  },
];

function programTargetsBaseline(): ProgramTargetsRow[] {
  return [
    {
      exerciseId: EX_BENCH,
      order: 1,
      targetSets: 3,
      targetWeightKg: 100,
      targetTotalReps: null,
      targetTopSetReps: 8,
      targetRir: 2,
      notes: null,
    },
    {
      exerciseId: EX_ROW,
      order: 2,
      targetSets: 3,
      targetWeightKg: 70,
      targetTotalReps: null,
      targetTopSetReps: 10,
      targetRir: 2,
      notes: null,
    },
  ];
}

function mkSets(
  weightKg: number,
  reps: number,
  rir: number,
  count: number,
): CompletedSessionExerciseRow["sets"] {
  return Array.from({ length: count }, (_, i) => ({
    setNumber: i + 1,
    weightKg,
    reps,
    rir,
    setCompleted: true,
  }));
}

function completedExercise(
  exerciseId: string,
  order: number,
  targetSets: number,
  targetWeightKg: number | null,
  targetTopSetReps: number | null,
  targetRir: number | null,
  sets: CompletedSessionExerciseRow["sets"],
): CompletedSessionExerciseRow {
  return {
    exerciseId,
    order,
    targetSets,
    targetWeightKg,
    targetTotalReps: null,
    targetTopSetReps,
    targetRir,
    sets,
  };
}

function mkSession(
  sessionId: string,
  dateIso: string,
  exercises: CompletedSessionExerciseRow[],
): CompletedSessionSnapshot {
  return {
    sessionId,
    datePerformed: dateIso,
    sessionStatus: SessionStatuses.completed,
    exercises,
  };
}

function previousWeightsFromInput(input: BuildUserPromptInput): Map<string, number> {
  const weights = new Map<string, number>();
  if (input.previousGeneratedTargets !== null && input.previousGeneratedTargets.length > 0) {
    for (const ex of input.previousGeneratedTargets) {
      const maxWeight = Math.max(...ex.sets.map((s) => s.targetWeightKg), 0);
      if (maxWeight > 0) weights.set(ex.exerciseId, maxWeight);
    }
    return weights;
  }
  if (input.historySessions.length > 0) {
    const latest = input.historySessions[0];
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

function aiOutputToPreviousTargets(
  output: AiWorkoutGenerationOutput,
  orderById: Map<string, number>,
): GeneratedTargetsRow[] {
  return output.exercises.map((ex) => ({
    exerciseId: ex.exerciseId,
    order: orderById.get(ex.exerciseId) ?? 0,
    targetSets: ex.targetSets,
    targetRir: ex.targetRir ?? null,
    notes: ex.notes ?? null,
    sets: ex.sets.map((s) => ({
      setNumber: s.setNumber,
      targetWeightKg: s.targetWeight,
      targetReps: s.targetReps,
      targetRir: s.targetRir ?? null,
    })),
  }));
}

function printDivider(title: string): void {
  console.log("\n" + "=".repeat(88));
  console.log(title);
  console.log("=".repeat(88));
}

function describePrescribed(ex: CompletedSessionExerciseRow, units: Units): string {
  const w =
    ex.targetWeightKg !== null ? formatWeightForPrompt(ex.targetWeightKg, units) : "—";
  const repHint =
    ex.targetTopSetReps !== null ? `${String(ex.targetTopSetReps)} reps (top-set hint)` : "—";
  const rir = ex.targetRir !== null ? String(ex.targetRir) : "—";
  return `${String(ex.targetSets)} sets @ ${w}, ${repHint}, RIR ${rir}`;
}

function performedSummary(ex: CompletedSessionExerciseRow, units: Units): string {
  return ex.sets
    .map(
      (s) =>
        `set${String(s.setNumber)} ${formatWeightForPrompt(s.weightKg, units)}×${String(s.reps)} @RIR${String(s.rir)}`,
    )
    .join(" | ");
}

function printScenarioPreamble(input: BuildUserPromptInput): void {
  const units = input.units;
  console.log("\nContext:");
  console.log(
    `  Previous AI targets in prompt: ${input.previousGeneratedTargets === null ? "none" : "yes (see Targets section in prompt)"}`,
  );
  console.log(`  History sessions passed in: ${String(input.historySessions.length)}`);
  const newestHistory = input.historySessions[0];
  if (newestHistory) {
    console.log(`  Newest history session id: ${newestHistory.sessionId}`);
  }
  console.log("\n  Prescribed going in (per exercise) → actual performance:");
  for (const ex of [...input.completedSession.exercises].sort((a, b) => a.order - b.order)) {
    const meta = EXERCISE_CONTEXTS.find((c) => c.exerciseId === ex.exerciseId);
    const name = meta?.name ?? ex.exerciseId;
    console.log(`  • ${name}`);
    console.log(`      Planned:  ${describePrescribed(ex, units)}`);
    console.log(`      Logged:   ${performedSummary(ex, units)}`);
  }
}

function printNewTargets(output: AiWorkoutGenerationOutput, units: Units): void {
  console.log("\n  New AI targets (next time this workout):");
  for (const ex of output.exercises) {
    const meta = EXERCISE_CONTEXTS.find((c) => c.exerciseId === ex.exerciseId);
    const name = meta?.name ?? ex.exerciseId;
    console.log(`  • ${name} — ${String(ex.targetSets)} sets, RIR ${ex.targetRir === null || ex.targetRir === undefined ? "—" : String(ex.targetRir)}`);
    if (ex.notes) {
      console.log(`      Notes: ${ex.notes}`);
    }
    for (const s of ex.sets) {
      console.log(
        `      Set ${String(s.setNumber)}: ${formatWeightForPrompt(s.targetWeight, units)} × ${String(s.targetReps)} @RIR ${s.targetRir === null || s.targetRir === undefined ? "—" : String(s.targetRir)}`,
      );
    }
  }
}

async function runOneGeneration(
  label: string,
  input: BuildUserPromptInput,
): Promise<AiWorkoutGenerationOutput> {
  if (!config.aiGenerationEnabled) {
    throw new Error(
      "Set AI_GENERATION_ENABLED=true and valid AI_* env vars (see server/src/config/config.ts).",
    );
  }

  const provider = createAiProvider(config);
  if (!provider) {
    throw new Error("AI provider could not be created.");
  }

  const { systemPrompt, userPrompt } = buildProgressionPrompt({
    ...input,
    programWorkoutName: input.programWorkoutName ?? "Demo Push/Pull (synthetic)",
    programWorkoutDayNumber: input.programWorkoutDayNumber ?? 1,
    preferences: DEFAULT_AI_PREFERENCES,
  });

  const validationContext: BusinessValidationContext = {
    programExerciseIds: [...PROGRAM_EXERCISE_IDS],
    previousWeightsByExercise: previousWeightsFromInput(input),
  };

  printDivider(label);
  printScenarioPreamble(input);
  console.log("\n  Calling OpenAI (structured output + business validation + retries)…");

  try {
    const result = await executeWithRetry({
      callAi: (retryFeedback) =>
        provider.completeStructured({
          systemPrompt,
          userPrompt: retryFeedback ? `${userPrompt}\n\n---\n\n${retryFeedback}` : userPrompt,
          schema: aiWorkoutGenerationOutputSchema,
          structuredOutputName: "workout_generation_output",
        }),
      validate: (data) => validateAiOutputBusinessRules(data, validationContext),
      onStatusChange: (status) => {
        if (status === "retrying") {
          console.log("    …retrying after validation / provider issue");
        }
      },
    });

    const ordered = orderAiExercisesLikeProgram([...PROGRAM_EXERCISE_IDS], result.data);
    const normalized: AiWorkoutGenerationOutput = { exercises: ordered };

    console.log(
      `\n  OK — attempts: ${String(result.attempts)}, latency: ${String(result.latencyMs)} ms, tokens in/out: ${String(result.usage.inputTokens)}/${String(result.usage.outputTokens)}`,
    );
    printNewTargets(normalized, input.units);
    return normalized;
  } catch (e) {
    if (e instanceof AiProviderError) {
      console.error(`\n  AI error [${e.code}]: ${e.message}`);
    } else {
      console.error(e);
    }
    throw e;
  }
}

async function main(): Promise<void> {
  if (!config.aiGenerationEnabled) {
    console.error(
      "AI_GENERATION_ENABLED is not true. Enable it in .env along with AI_API_KEY and AI_MODEL, then re-run.",
    );
    process.exit(1);
  }

  const baselineTargets = programTargetsBaseline();
  const baselineBench = baselineTargets[0];
  const baselineRow = baselineTargets[1];
  if (baselineBench === undefined || baselineRow === undefined) {
    throw new Error("programTargetsBaseline must return bench and row targets");
  }

  const base: Pick<
    BuildUserPromptInput,
    "units" | "exerciseContexts" | "programWorkoutTargets" | "historySessions"
  > = {
    units: Units.metric,
    exerciseContexts: EXERCISE_CONTEXTS,
    programWorkoutTargets: baselineTargets,
    historySessions: [],
  };

  await runOneGeneration(
    "Scenario A — User exceeds prescribed reps (same weight, more reps than top-set hint)",
    {
      ...base,
      completedSession: mkSession("sess-exceed", "2026-04-18T10:00:00.000Z", [
        completedExercise(
          EX_BENCH,
          1,
          baselineBench.targetSets,
          baselineBench.targetWeightKg,
          baselineBench.targetTopSetReps,
          baselineBench.targetRir,
          mkSets(100, 10, 2, 3),
        ),
        completedExercise(
          EX_ROW,
          2,
          baselineRow.targetSets,
          baselineRow.targetWeightKg,
          baselineRow.targetTopSetReps,
          baselineRow.targetRir,
          mkSets(70, 12, 2, 3),
        ),
      ]),
      previousGeneratedTargets: null,
    },
  );

  await runOneGeneration(
    "Scenario B — User matches prescription closely",
    {
      ...base,
      completedSession: mkSession("sess-match", "2026-04-18T11:00:00.000Z", [
        completedExercise(
          EX_BENCH,
          1,
          baselineBench.targetSets,
          baselineBench.targetWeightKg,
          baselineBench.targetTopSetReps,
          baselineBench.targetRir,
          mkSets(100, 8, 2, 3),
        ),
        completedExercise(
          EX_ROW,
          2,
          baselineRow.targetSets,
          baselineRow.targetWeightKg,
          baselineRow.targetTopSetReps,
          baselineRow.targetRir,
          mkSets(70, 10, 2, 3),
        ),
      ]),
      previousGeneratedTargets: null,
    },
  );

  await runOneGeneration(
    "Scenario C — User underperforms vs prescription (fewer reps @ same weight)",
    {
      ...base,
      completedSession: mkSession("sess-under", "2026-04-18T12:00:00.000Z", [
        completedExercise(
          EX_BENCH,
          1,
          baselineBench.targetSets,
          baselineBench.targetWeightKg,
          baselineBench.targetTopSetReps,
          baselineBench.targetRir,
          mkSets(100, 5, 3, 3),
        ),
        completedExercise(
          EX_ROW,
          2,
          baselineRow.targetSets,
          baselineRow.targetWeightKg,
          baselineRow.targetTopSetReps,
          baselineRow.targetRir,
          mkSets(70, 6, 3, 3),
        ),
      ]),
      previousGeneratedTargets: null,
    },
  );

  printDivider("Scenario D — Back-to-back on the same workout (three completions in a row)");

  const historyFromSession = (snap: CompletedSessionSnapshot): ProgramWorkoutHistorySession => ({
    sessionId: snap.sessionId,
    datePerformed: snap.datePerformed,
    sessionStatus: snap.sessionStatus,
    exercises: snap.exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      order: ex.order,
      sets: ex.sets.map((s) => ({
        setNumber: s.setNumber,
        weightKg: s.weightKg,
        reps: s.reps,
        rir: s.rir,
      })),
    })),
  });

  let history: ProgramWorkoutHistorySession[] = [];
  let previousAi: GeneratedTargetsRow[] | null = null;

  const session1 = mkSession("sess-chain-1", "2026-04-10T09:00:00.000Z", [
    completedExercise(
      EX_BENCH,
      1,
      3,
      80,
      5,
      2,
      mkSets(80, 5, 2, 3),
    ),
    completedExercise(EX_ROW, 2, 3, 60, 8, 2, mkSets(60, 8, 2, 3)),
  ]);

  const out1 = await runOneGeneration("  D1 — First completion (program baseline; no prior AI row)", {
    ...base,
    programWorkoutTargets: [
      { ...baselineBench, targetWeightKg: 80, targetTopSetReps: 5 },
      { ...baselineRow, targetWeightKg: 60, targetTopSetReps: 8 },
    ],
    completedSession: session1,
    previousGeneratedTargets: null,
    historySessions: [],
  });
  previousAi = aiOutputToPreviousTargets(out1, ORDER_BY_ID);
  history = [historyFromSession(session1)];

  const prescribedFromAi = (
    targets: GeneratedTargetsRow[],
  ): { bench: CompletedSessionExerciseRow; row: CompletedSessionExerciseRow } => {
    const b = targets.find((t) => t.exerciseId === EX_BENCH);
    const r = targets.find((t) => t.exerciseId === EX_ROW);
    if (b === undefined || r === undefined) {
      throw new Error("AI targets must include bench and row exercises");
    }
    return {
      bench: completedExercise(
        EX_BENCH,
        1,
        b.targetSets,
        b.sets[0]?.targetWeightKg ?? null,
        b.sets[0]?.targetReps ?? null,
        b.targetRir,
        b.sets.map((s) => ({
          setNumber: s.setNumber,
          weightKg: s.targetWeightKg,
          reps: s.targetReps,
          rir: s.targetRir ?? 2,
          setCompleted: true,
        })),
      ),
      row: completedExercise(
        EX_ROW,
        2,
        r.targetSets,
        r.sets[0]?.targetWeightKg ?? null,
        r.sets[0]?.targetReps ?? null,
        r.targetRir,
        r.sets.map((s) => ({
          setNumber: s.setNumber,
          weightKg: s.targetWeightKg,
          reps: s.targetReps,
          rir: s.targetRir ?? 2,
          setCompleted: true,
        })),
      ),
    };
  };

  const { bench: s2Bench, row: s2Row } = prescribedFromAi(previousAi);
  const session2 = mkSession("sess-chain-2", "2026-04-12T09:00:00.000Z", [s2Bench, s2Row]);

  const out2 = await runOneGeneration(
    "  D2 — Second completion: user does exactly what AI prescribed last time",
    {
      ...base,
      programWorkoutTargets: [
        { ...baselineBench, targetWeightKg: 80, targetTopSetReps: 5 },
        { ...baselineRow, targetWeightKg: 60, targetTopSetReps: 8 },
      ],
      completedSession: session2,
      previousGeneratedTargets: previousAi,
      historySessions: history,
    },
  );
  previousAi = aiOutputToPreviousTargets(out2, ORDER_BY_ID);
  history = [historyFromSession(session2), ...history];

  const { bench: baseBench3, row: baseRow3 } = prescribedFromAi(previousAi);
  const s3BenchSets = baseBench3.sets.map((s, i) =>
    i === 0 ? { ...s, reps: s.reps + 2 } : s,
  );
  const s3RowSets = baseRow3.sets.map((s) => ({ ...s, reps: s.reps + 1 }));
  const session3 = mkSession("sess-chain-3", "2026-04-14T09:00:00.000Z", [
    { ...baseBench3, sets: s3BenchSets },
    { ...baseRow3, sets: s3RowSets },
  ]);

  await runOneGeneration(
    "  D3 — Third completion: user beats last AI targets (extra reps on bench top set, +1 rep each row set)",
    {
      ...base,
      programWorkoutTargets: [
        { ...baselineBench, targetWeightKg: 80, targetTopSetReps: 5 },
        { ...baselineRow, targetWeightKg: 60, targetTopSetReps: 8 },
      ],
      completedSession: session3,
      previousGeneratedTargets: previousAi,
      historySessions: history,
    },
  );

  console.log("\nDone.\n");
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
