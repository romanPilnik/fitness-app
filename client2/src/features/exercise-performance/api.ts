import { getEnvelope } from '@/api/client';
import type { ExercisePerformanceSummary } from './types';

export const exercisePerformanceQueryKeys = {
  all: ['exercise-performance'] as const,
  detail: (exerciseId: string) =>
    [...exercisePerformanceQueryKeys.all, 'detail', exerciseId] as const,
};

export async function fetchExercisePerformance(
  exerciseId: string,
): Promise<ExercisePerformanceSummary> {
  return getEnvelope<ExercisePerformanceSummary>(
    `/exercise-performance/${encodeURIComponent(exerciseId)}/performance`,
  );
}
