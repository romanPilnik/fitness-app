import { isSetFullyLogged, type LogSessionForm } from './schemas';

/** A set counts as having no logged work (default / untouched). */
export function isSessionSetLogEmpty(
  set: LogSessionForm['exercises'][number]['sets'][number],
): boolean {
  const rir = set.rir ?? 0;
  return (
    !set.setCompleted && set.reps === 0 && set.weight === 0 && rir === 0
  );
}

export type LogSessionEmptyDetail = 'blank' | 'unmarked';

export type LogSessionCompletionResult =
  | { kind: 'empty'; emptyDetail: LogSessionEmptyDetail }
  | { kind: 'complete' }
  | { kind: 'partial' };

/**
 * Submit flow: if no set is marked complete, the session is treated as empty (skipped / empty-save prompt).
 * `emptyDetail` distinguishes a blank sheet from “typed reps/weight but never tapped complete”.
 */
export function classifyLogSessionCompletion(
  exercises: LogSessionForm['exercises'],
): LogSessionCompletionResult {
  const allSets = exercises.flatMap((ex) => ex.sets);
  if (allSets.length === 0) return { kind: 'empty', emptyDetail: 'blank' };

  if (!allSets.some((s) => s.setCompleted)) {
    const allBlank = allSets.every(isSessionSetLogEmpty);
    return {
      kind: 'empty',
      emptyDetail: allBlank ? 'blank' : 'unmarked',
    };
  }

  if (allSets.every((s) => isSetFullyLogged(s))) return { kind: 'complete' };

  return { kind: 'partial' };
}

/** Keeps only fully logged sets (reps and weight &gt; 0); drops exercises with none left; renumbers `order`. */
export function pruneLogSessionToCompletedSetsOnly(
  values: LogSessionForm,
): LogSessionForm {
  const exercises = values.exercises
    .map((ex) => {
      const completedSets = ex.sets.filter((s) => isSetFullyLogged(s));
      if (completedSets.length === 0) return null;
      return {
        ...ex,
        targetSets: completedSets.length,
        sets: completedSets,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x != null)
    .map((ex, i) => ({ ...ex, order: i + 1 }));

  return { ...values, exercises };
}
