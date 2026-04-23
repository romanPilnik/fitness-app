import type { AiWorkoutGenerationOutput } from "./workoutGeneration.validation.js";

export interface BusinessValidationError {
  field: string;
  rule: string;
  message: string;
}

export interface BusinessValidationContext {
  programExerciseIds: string[];
  previousWeightsByExercise: Map<string, number>;
}

const MAX_SETS_PER_EXERCISE = 10;
const MAX_WEIGHT_KG = 500;
const MAX_REPS = 100;
const MAX_WEIGHT_MULTIPLIER = 2;
const MIN_WEIGHT_MULTIPLIER = 0.25;

type ExerciseEntry = AiWorkoutGenerationOutput["exercises"][number];

export function validateAiOutputBusinessRules(
  output: AiWorkoutGenerationOutput,
  context: BusinessValidationContext,
): BusinessValidationError[] {
  const errors: BusinessValidationError[] = [];

  validateExerciseIds(output, context.programExerciseIds, errors);
  for (const [i, ex] of output.exercises.entries()) {
    const prefix = `exercises[${String(i)}]`;
    validateSetConsistency(ex, prefix, errors);
    validateSetBounds(ex, prefix, errors);
    validateWeightJumps(ex, prefix, context.previousWeightsByExercise, errors);
  }

  return errors;
}

function validateExerciseIds(
  output: AiWorkoutGenerationOutput,
  programExerciseIds: string[],
  errors: BusinessValidationError[],
): void {
  const outputIds = new Set(output.exercises.map((e) => e.exerciseId));
  const programIds = new Set(programExerciseIds);

  if (output.exercises.length !== programExerciseIds.length) {
    errors.push({
      field: "exercises",
      rule: "EXERCISE_COUNT_MISMATCH",
      message: `Expected ${String(programExerciseIds.length)} exercises, got ${String(output.exercises.length)}`,
    });
  }

  for (const id of programExerciseIds) {
    if (!outputIds.has(id)) {
      errors.push({
        field: "exercises",
        rule: "MISSING_EXERCISE",
        message: `Missing exercise ${id} from AI output`,
      });
    }
  }

  for (const id of outputIds) {
    if (!programIds.has(id)) {
      errors.push({
        field: "exercises",
        rule: "EXTRA_EXERCISE",
        message: `Unexpected exercise ${id} in AI output`,
      });
    }
  }
}

function validateSetConsistency(
  ex: ExerciseEntry,
  prefix: string,
  errors: BusinessValidationError[],
): void {
  if (ex.targetSets !== ex.sets.length) {
    errors.push({
      field: `${prefix}.targetSets`,
      rule: "TARGET_SETS_MISMATCH",
      message: `targetSets is ${String(ex.targetSets)} but ${String(ex.sets.length)} sets provided for exercise ${ex.exerciseId}`,
    });
  }

  for (const [i, s] of ex.sets.entries()) {
    if (s.setNumber !== i + 1) {
      errors.push({
        field: `${prefix}.sets[${String(i)}].setNumber`,
        rule: "SET_NUMBER_SEQUENCE",
        message: `Set number should be ${String(i + 1)} but got ${String(s.setNumber)} for exercise ${ex.exerciseId}`,
      });
    }
  }

  if (ex.sets.length > MAX_SETS_PER_EXERCISE) {
    errors.push({
      field: `${prefix}.sets`,
      rule: "TOO_MANY_SETS",
      message: `${String(ex.sets.length)} sets exceeds maximum of ${String(MAX_SETS_PER_EXERCISE)} for exercise ${ex.exerciseId}`,
    });
  }
}

function validateSetBounds(
  ex: ExerciseEntry,
  prefix: string,
  errors: BusinessValidationError[],
): void {
  for (const [i, s] of ex.sets.entries()) {
    if (s.targetWeight > MAX_WEIGHT_KG) {
      errors.push({
        field: `${prefix}.sets[${String(i)}].targetWeight`,
        rule: "WEIGHT_TOO_HIGH",
        message: `Weight ${String(s.targetWeight)}kg exceeds maximum of ${String(MAX_WEIGHT_KG)}kg for exercise ${ex.exerciseId} set ${String(s.setNumber)}`,
      });
    }
    if (s.targetReps > MAX_REPS) {
      errors.push({
        field: `${prefix}.sets[${String(i)}].targetReps`,
        rule: "REPS_TOO_HIGH",
        message: `Reps ${String(s.targetReps)} exceeds maximum of ${String(MAX_REPS)} for exercise ${ex.exerciseId} set ${String(s.setNumber)}`,
      });
    }
  }
}

function validateWeightJumps(
  ex: ExerciseEntry,
  prefix: string,
  previousWeightsByExercise: Map<string, number>,
  errors: BusinessValidationError[],
): void {
  const prevWeight = previousWeightsByExercise.get(ex.exerciseId);
  if (prevWeight === undefined || prevWeight === 0) {
    return;
  }
  for (const [i, s] of ex.sets.entries()) {
    if (s.targetWeight === 0) continue;
    if (s.targetWeight > prevWeight * MAX_WEIGHT_MULTIPLIER) {
      errors.push({
        field: `${prefix}.sets[${String(i)}].targetWeight`,
        rule: "WEIGHT_JUMP_TOO_LARGE",
        message: `Weight ${String(s.targetWeight)}kg is more than ${String(MAX_WEIGHT_MULTIPLIER)}x previous weight ${String(prevWeight)}kg for exercise ${ex.exerciseId} set ${String(s.setNumber)}`,
      });
    }
    if (s.targetWeight < prevWeight * MIN_WEIGHT_MULTIPLIER) {
      errors.push({
        field: `${prefix}.sets[${String(i)}].targetWeight`,
        rule: "WEIGHT_DROP_TOO_LARGE",
        message: `Weight ${String(s.targetWeight)}kg is less than ${String(MIN_WEIGHT_MULTIPLIER)}x previous weight ${String(prevWeight)}kg for exercise ${ex.exerciseId} set ${String(s.setNumber)}`,
      });
    }
  }
}
