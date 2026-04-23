/**
 * Prints system + user prompts for Scenario A (exceed) from e2eAiWorkoutGenerationDemos.
 * Run: npx tsx src/scripts/printDemoPromptSample.ts
 */
import {
  Equipment,
  ExerciseCategory,
  MovementPattern,
  MuscleGroup,
  SessionStatuses,
  Units,
} from "@/generated/prisma/enums.js";
import { DEFAULT_AI_PREFERENCES } from "@/features/workoutGeneration/prompts/aiPreferences.js";
import { buildProgressionPrompt } from "@/features/workoutGeneration/prompts/buildProgressionPrompt.js";
import type {
  BuildUserPromptInput,
  CompletedSessionExerciseRow,
  ProgramTargetsRow,
} from "@/features/workoutGeneration/prompts/progressionPromptTypes.js";

const EX_BENCH = "demo-ex-bench";
const EX_ROW = "demo-ex-row";

const EXERCISE_CONTEXTS = [
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

const BASELINE = programTargetsBaseline();
const baselineBench = BASELINE[0];
const baselineRow = BASELINE[1];
if (baselineBench === undefined || baselineRow === undefined) {
  throw new Error("programTargetsBaseline must return bench and row targets");
}

const input: BuildUserPromptInput = {
  units: Units.metric,
  programWorkoutName: "Demo Push/Pull (synthetic)",
  programWorkoutDayNumber: 1,
  exerciseContexts: [...EXERCISE_CONTEXTS],
  programWorkoutTargets: BASELINE,
  previousGeneratedTargets: null,
  historySessions: [],
  completedSession: {
    sessionId: "sess-exceed",
    datePerformed: "2026-04-18T10:00:00.000Z",
    sessionStatus: SessionStatuses.completed,
    exercises: [
      {
        exerciseId: EX_BENCH,
        order: 1,
        targetSets: baselineBench.targetSets,
        targetWeightKg: baselineBench.targetWeightKg,
        targetTotalReps: null,
        targetTopSetReps: baselineBench.targetTopSetReps,
        targetRir: baselineBench.targetRir,
        sets: mkSets(100, 10, 2, 3),
      },
      {
        exerciseId: EX_ROW,
        order: 2,
        targetSets: baselineRow.targetSets,
        targetWeightKg: baselineRow.targetWeightKg,
        targetTotalReps: null,
        targetTopSetReps: baselineRow.targetTopSetReps,
        targetRir: baselineRow.targetRir,
        sets: mkSets(70, 12, 2, 3),
      },
    ],
  },
};

const { systemPrompt, userPrompt } = buildProgressionPrompt({
  ...input,
  preferences: DEFAULT_AI_PREFERENCES,
});

console.log("──────── SYSTEM PROMPT ────────\n");
console.log(systemPrompt);
console.log("\n──────── USER PROMPT ────────\n");
console.log(userPrompt);
