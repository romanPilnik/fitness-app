import {
  deleteEnvelope,
  getEnvelope,
  patchEnvelope,
  postEnvelope,
  putEnvelope,
} from '@/api/client';
import { DEFAULT_LIST_LIMIT, type CursorPage } from '@/api/pagination';
import type {
  ProgramDetail,
  ProgramListSort,
  ProgramSummary,
  ProgramWorkout,
  ProgramWorkoutExercise,
} from './types';

export const programQueryKeys = {
  all: ['programs'] as const,
  list: () => [...programQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...programQueryKeys.all, 'detail', id] as const,
  active: () => [...programQueryKeys.all, 'active'] as const,
};

export type ProgramListParams = {
  cursor?: string;
  limit?: number;
  sort?: ProgramListSort;
  status?: string;
  difficulty?: string;
  goal?: string;
  splitType?: string;
  createdFrom?: string;
};

export async function fetchProgramsPage(
  params: ProgramListParams = {},
): Promise<CursorPage<ProgramSummary>> {
  const {
    cursor,
    limit = DEFAULT_LIST_LIMIT,
    sort,
    status,
    difficulty,
    goal,
    splitType,
    createdFrom,
  } = params;
  return getEnvelope<CursorPage<ProgramSummary>>('/programs', {
    params: {
      ...(cursor ? { cursor } : {}),
      limit,
      ...(sort ? { sort } : {}),
      ...(status ? { status } : {}),
      ...(difficulty ? { difficulty } : {}),
      ...(goal ? { goal } : {}),
      ...(splitType ? { splitType } : {}),
      ...(createdFrom ? { createdFrom } : {}),
    },
  });
}

export async function fetchProgramById(id: string): Promise<ProgramDetail> {
  return getEnvelope<ProgramDetail>(`/programs/${encodeURIComponent(id)}`);
}

export async function fetchActivePrograms(): Promise<ProgramDetail[]> {
  return getEnvelope<ProgramDetail[]>('/programs/active');
}

export type CreateFromTemplateBody = {
  templateId: string;
  name?: string;
  startDate?: string;
};

export type CreateCustomProgramBody = {
  name: string;
  description?: string;
  difficulty: string;
  goal: string;
  splitType: string;
  daysPerWeek: number;
  startDate?: string;
  workouts: Array<{
    name: string;
    dayNumber: number;
    exercises: Array<{
      exerciseId: string;
      order: number;
      targetSets: number;
      targetWeight?: number;
      targetTotalReps?: number;
      targetTopSetReps?: number;
      targetRir?: number;
    }>;
  }>;
};

export type UpdateProgramBody = Partial<{
  name: string;
  description: string | null;
  difficulty: string;
  goal: string;
  splitType: string;
  daysPerWeek: number;
  status: string;
  startDate: string;
}>;

export type AddProgramWorkoutBody = { name: string; dayNumber: number };

export type UpdateProgramWorkoutBody = Partial<{
  name: string;
  dayNumber: number;
}>;

export type AddWorkoutExerciseBody = {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetWeight?: number;
  targetTotalReps?: number;
  targetTopSetReps?: number;
  targetRir?: number;
};

export type UpdateWorkoutExerciseBody = Partial<{
  order: number;
  targetSets: number;
  targetWeight: number | null;
  targetTotalReps: number | null;
  targetTopSetReps: number | null;
  targetRir: number | null;
}>;

export type BulkReorderExercisesBody = {
  exercises: Array<{ id: string; order: number }>;
};

export async function createProgramFromTemplate(
  body: CreateFromTemplateBody,
): Promise<ProgramDetail> {
  return postEnvelope<ProgramDetail>('/programs/from-template', body);
}

export async function createCustomProgram(body: CreateCustomProgramBody): Promise<ProgramDetail> {
  return postEnvelope<ProgramDetail>('/programs/custom', body);
}

export async function updateProgram(
  programId: string,
  body: UpdateProgramBody,
): Promise<ProgramDetail> {
  return patchEnvelope<ProgramDetail>(`/programs/${encodeURIComponent(programId)}`, body);
}

export async function deleteProgram(programId: string): Promise<void> {
  return deleteEnvelope(`/programs/${encodeURIComponent(programId)}`);
}

export async function addProgramWorkout(
  programId: string,
  body: AddProgramWorkoutBody,
): Promise<ProgramWorkout> {
  return postEnvelope<ProgramWorkout>(`/programs/${encodeURIComponent(programId)}/workouts`, body);
}

export async function updateProgramWorkout(
  programId: string,
  workoutId: string,
  body: UpdateProgramWorkoutBody,
): Promise<ProgramWorkout> {
  return patchEnvelope<ProgramWorkout>(
    `/programs/${encodeURIComponent(programId)}/workouts/${encodeURIComponent(workoutId)}`,
    body,
  );
}

export async function deleteProgramWorkout(programId: string, workoutId: string): Promise<void> {
  return deleteEnvelope(
    `/programs/${encodeURIComponent(programId)}/workouts/${encodeURIComponent(workoutId)}`,
  );
}

export async function addWorkoutExercise(
  programId: string,
  workoutId: string,
  body: AddWorkoutExerciseBody,
): Promise<ProgramWorkoutExercise> {
  return postEnvelope<ProgramWorkoutExercise>(
    `/programs/${encodeURIComponent(programId)}/workouts/${encodeURIComponent(workoutId)}/exercises`,
    body,
  );
}

export async function updateWorkoutExercise(
  programId: string,
  workoutId: string,
  workoutExerciseId: string,
  body: UpdateWorkoutExerciseBody,
): Promise<ProgramWorkoutExercise> {
  return patchEnvelope<ProgramWorkoutExercise>(
    `/programs/${encodeURIComponent(programId)}/workouts/${encodeURIComponent(workoutId)}/exercises/${encodeURIComponent(workoutExerciseId)}`,
    body,
  );
}

export async function deleteWorkoutExercise(
  programId: string,
  workoutId: string,
  workoutExerciseId: string,
): Promise<void> {
  return deleteEnvelope(
    `/programs/${encodeURIComponent(programId)}/workouts/${encodeURIComponent(workoutId)}/exercises/${encodeURIComponent(workoutExerciseId)}`,
  );
}

export async function bulkReorderWorkoutExercises(
  programId: string,
  workoutId: string,
  body: BulkReorderExercisesBody,
): Promise<ProgramWorkoutExercise[]> {
  return putEnvelope<ProgramWorkoutExercise[]>(
    `/programs/${encodeURIComponent(programId)}/workouts/${encodeURIComponent(workoutId)}/exercises/reorder`,
    body,
  );
}
