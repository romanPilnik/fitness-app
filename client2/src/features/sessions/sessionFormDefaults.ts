import type { LogSessionForm } from './schemas';

export function defaultSets(
  count: number,
  targetWeight?: number | null,
  targetReps?: number | null,
): LogSessionForm['exercises'][number]['sets'] {
  return Array.from({ length: count }, () => ({
    targetWeight: targetWeight ?? undefined,
    targetReps: targetReps ?? undefined,
    reps: 0,
    weight: 0,
    rir: undefined,
    setCompleted: false,
  }));
}

export function oneEmptySet(): LogSessionForm['exercises'][number]['sets'][number] {
  return {
    reps: 0,
    weight: 0,
    rir: undefined,
    setCompleted: false,
  };
}
