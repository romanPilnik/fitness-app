import { deleteEnvelope, getEnvelope, postEnvelope } from '@/api/client';
import { DEFAULT_LIST_LIMIT, type CursorPage } from '@/api/pagination';
import type { Exercise, ExerciseListSort } from './types';

export type CreateExerciseBody = {
  name: string;
  equipment: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  category: string;
  movementPattern: string;
  instructions?: string;
};

export const exerciseQueryKeys = {
  all: ['exercises'] as const,
  list: () => [...exerciseQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...exerciseQueryKeys.all, 'detail', id] as const,
};

export type ExerciseListParams = {
  cursor?: string;
  limit?: number;
  primaryMuscle?: string;
  equipment?: string;
  category?: string;
  movementPattern?: string;
  sort?: ExerciseListSort;
};

export async function fetchExercisesPage(
  params: ExerciseListParams = {},
): Promise<CursorPage<Exercise>> {
  const {
    cursor,
    limit = DEFAULT_LIST_LIMIT,
    primaryMuscle,
    equipment,
    category,
    movementPattern,
    sort,
  } = params;
  return getEnvelope<CursorPage<Exercise>>('/exercises', {
    params: {
      ...(cursor ? { cursor } : {}),
      limit,
      ...(primaryMuscle ? { primaryMuscle } : {}),
      ...(equipment ? { equipment } : {}),
      ...(category ? { category } : {}),
      ...(movementPattern ? { movementPattern } : {}),
      ...(sort ? { sort } : {}),
    },
  });
}

export async function fetchExerciseById(id: string): Promise<Exercise> {
  return getEnvelope<Exercise>(`/exercises/${encodeURIComponent(id)}`);
}

export async function createExercise(body: CreateExerciseBody): Promise<Exercise> {
  return postEnvelope<Exercise>('/exercises', body);
}

export async function deleteExercise(id: string): Promise<void> {
  await deleteEnvelope(`/exercises/${encodeURIComponent(id)}`);
}
