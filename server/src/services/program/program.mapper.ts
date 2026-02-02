import type { PaginateResult } from 'mongoose';
import type { IProgram } from '../../interfaces';
import type {
  ProgramDTO,
  ProgramSummaryDTO,
  WorkoutDTO,
  ProgramExerciseDTO,
} from './program.dto.js';

type PopulatedExercise = {
  _id?: { toString(): string };
  name?: string;
};

type PopulatedProgramExercise = {
  exerciseId?: PopulatedExercise | { toString(): string };
  order?: number;
  targetSets?: number;
  targetReps?: number;
  targetRir?: number;
  notes?: string;
};

type PopulatedWorkout = {
  name?: string;
  dayNumber?: number;
  exercises?: PopulatedProgramExercise[];
};

type PopulatedProgram = IProgram & {
  _id?: { toString(): string };
  userId?: { toString(): string };
  sourceTemplateId?: { toString(): string } | null;
  workouts?: PopulatedWorkout[];
  createdAt?: Date;
  updatedAt?: Date;
};

function toExerciseDTO(exercise: PopulatedProgramExercise): ProgramExerciseDTO {
  let exerciseIdStr = '';
  if (exercise.exerciseId) {
    if (typeof exercise.exerciseId === 'object' && '_id' in exercise.exerciseId) {
      exerciseIdStr = exercise.exerciseId._id?.toString() ?? '';
    } else {
      exerciseIdStr = (exercise.exerciseId as { toString(): string }).toString();
    }
  }

  return {
    exerciseId: exerciseIdStr,
    order: exercise.order ?? 1,
    targetSets: exercise.targetSets ?? 3,
    targetReps: exercise.targetReps ?? 10,
    targetRir: exercise.targetRir ?? 2,
    notes: exercise.notes ?? undefined,
  };
}

function toWorkoutDTO(workout: PopulatedWorkout): WorkoutDTO {
  return {
    name: workout.name ?? '',
    dayNumber: workout.dayNumber,
    exercises: (workout.exercises ?? []).map(toExerciseDTO),
  };
}

export function toProgramDTO(program: PopulatedProgram): ProgramDTO {
  const rawId = (program as { _id?: { toString(): string } })._id;
  const rawUserId = program.userId;
  const rawTemplateId = program.sourceTemplateId;

  return {
    id: rawId ? rawId.toString() : '',
    userId: rawUserId ? rawUserId.toString() : '',
    sourceTemplateId: rawTemplateId ? rawTemplateId.toString() : undefined,
    sourceTemplateName: program.sourceTemplateName ?? undefined,
    createdFrom: program.createdFrom ?? 'scratch',
    name: program.name ?? '',
    description: program.description ?? undefined,
    difficulty: program.difficulty ?? 'intermediate',
    goals: program.goals ?? [],
    splitType: program.splitType ?? 'other',
    daysPerWeek: program.daysPerWeek ?? 3,
    workouts: (program.workouts ?? []).map(toWorkoutDTO),
    status: program.status ?? 'active',
    startDate: program.startDate ?? new Date(),
    currentWeek: program.currentWeek ?? 1,
    nextWorkoutIndex: program.nextWorkoutIndex ?? 0,
    lastCompletedWorkoutDate: program.lastCompletedWorkoutDate ?? undefined,
    hasBeenModified: program.hasBeenModified ?? false,
    createdAt: program.createdAt ?? new Date(),
    updatedAt: program.updatedAt ?? new Date(),
  };
}

export function toProgramSummaryDTO(program: PopulatedProgram): ProgramSummaryDTO {
  const rawId = (program as { _id?: { toString(): string } })._id;

  return {
    id: rawId ? rawId.toString() : '',
    name: program.name ?? '',
    description: program.description ?? undefined,
    difficulty: program.difficulty ?? 'intermediate',
    goals: program.goals ?? [],
    splitType: program.splitType ?? 'other',
    daysPerWeek: program.daysPerWeek ?? 3,
    status: program.status ?? 'active',
    currentWeek: program.currentWeek ?? 1,
    createdAt: program.createdAt ?? new Date(),
  };
}

export function mapPaginatedPrograms(
  result: PaginateResult<PopulatedProgram>,
): PaginateResult<ProgramSummaryDTO> {
  return {
    ...result,
    docs: result.docs.map(toProgramSummaryDTO),
  };
}
