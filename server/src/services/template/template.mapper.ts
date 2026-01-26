import type { PaginateResult } from 'mongoose';
import type { ProgramTemplate } from '../../models/Template.model.js';
import type {
  ProgramTemplateDTO,
  ProgramTemplateSummaryDTO,
  TemplateWorkoutDTO,
  TemplateExerciseDTO,
} from './template.dto.js';

type PopulatedExercise = {
  _id?: { toString(): string };
  name?: string;
};

type PopulatedTemplateExercise = {
  exerciseId?: PopulatedExercise | { toString(): string };
  order?: number;
  targetSets?: number;
  targetReps?: number;
  targetRir?: number;
  notes?: string;
};

type PopulatedTemplateWorkout = {
  name?: string;
  dayNumber?: number;
  exercises?: PopulatedTemplateExercise[];
};

type PopulatedTemplate = ProgramTemplate & {
  _id?: { toString(): string };
  workouts?: PopulatedTemplateWorkout[];
  createdAt?: Date;
  updatedAt?: Date;
};

function toTemplateExerciseDTO(exercise: PopulatedTemplateExercise): TemplateExerciseDTO {
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

function toTemplateWorkoutDTO(workout: PopulatedTemplateWorkout): TemplateWorkoutDTO {
  return {
    name: workout.name ?? '',
    dayNumber: workout.dayNumber,
    exercises: (workout.exercises ?? []).map(toTemplateExerciseDTO),
  };
}

export function toProgramTemplateDTO(template: PopulatedTemplate): ProgramTemplateDTO {
  const rawId = (template as { _id?: { toString(): string } })._id;

  return {
    id: rawId ? rawId.toString() : '',
    name: template.name ?? '',
    createdBy: template.createdBy ?? '',
    splitType: template.splitType ?? 'other',
    daysPerWeek: template.daysPerWeek ?? 3,
    description: template.description ?? undefined,
    difficulty: template.difficulty ?? 'intermediate',
    goals: template.goals ?? [],
    workouts: (template.workouts ?? []).map(toTemplateWorkoutDTO),
    createdAt: template.createdAt ?? new Date(),
    updatedAt: template.updatedAt ?? new Date(),
  };
}

export function toProgramTemplateSummaryDTO(template: PopulatedTemplate): ProgramTemplateSummaryDTO {
  const rawId = (template as { _id?: { toString(): string } })._id;

  return {
    id: rawId ? rawId.toString() : '',
    name: template.name ?? '',
    createdBy: template.createdBy ?? '',
    splitType: template.splitType ?? 'other',
    daysPerWeek: template.daysPerWeek ?? 3,
    description: template.description ?? undefined,
    difficulty: template.difficulty ?? 'intermediate',
    goals: template.goals ?? [],
    workoutCount: template.workouts?.length ?? 0,
  };
}

export function mapPaginatedTemplates(
  result: PaginateResult<PopulatedTemplate>,
): PaginateResult<ProgramTemplateSummaryDTO> {
  return {
    ...result,
    docs: result.docs.map(toProgramTemplateSummaryDTO),
  };
}
