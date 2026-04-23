import {
  defaultSyncPattern,
  type ScheduleSlotInput,
} from '@/features/programs/scheduleDefaults';
import type {
  ProgramDetail,
  SchedulePatternStoredSlot,
} from '@/features/programs/types';
import type { CustomProgramForm } from '@/features/programs/schemas';

const DEFAULT_ASYNC: CustomProgramForm['asyncPattern'] = [
  { type: 'workout', workoutIndex: 0 },
  { type: 'rest' },
];

function toInputSlot(
  s: unknown,
  idToIndex: Map<string, number>,
  workoutCount: number,
): ScheduleSlotInput {
  if (s && typeof s === 'object' && (s as { type: string }).type === 'rest') {
    return { type: 'rest' };
  }
  if (
    s &&
    typeof s === 'object' &&
    (s as { type: string }).type === 'workout' &&
    typeof (s as { programWorkoutId: string }).programWorkoutId === 'string'
  ) {
    const id = (s as { programWorkoutId: string }).programWorkoutId;
    const idx = idToIndex.get(id);
    const wi = idx !== undefined ? idx : 0;
    return { type: 'workout', workoutIndex: Math.min(wi, Math.max(0, workoutCount - 1)) };
  }
  return { type: 'rest' };
}

/** Map stored `schedulePattern` (UUID) + ordered workouts to create-form index slots for editing. */
export function programDetailToScheduleFormValues(p: ProgramDetail): {
  scheduleKind: 'sync_week' | 'async_block';
  syncPattern: CustomProgramForm['syncPattern'];
  asyncPattern: CustomProgramForm['asyncPattern'];
  __workoutCount: number;
} {
  const ordered = [...p.programWorkouts].sort((a, b) => {
    const sa = a.sequenceIndex ?? 0;
    const sb = b.sequenceIndex ?? 0;
    if (sa !== sb) return sa - sb;
    return a.dayNumber - b.dayNumber;
  });
  const n = Math.max(1, ordered.length);
  const idToIndex = new Map(ordered.map((w, i) => [w.id, i]));

  const kind = p.scheduleKind ?? 'sync_week';
  const raw = p.schedulePattern;
  const rawArr: unknown[] = Array.isArray(raw) ? (raw as unknown[]) : [];

  const syncFromDefault = defaultSyncPattern(ordered.length, p.daysPerWeek) as CustomProgramForm['syncPattern'];
  let syncPattern: CustomProgramForm['syncPattern'] = syncFromDefault;
  if (kind === 'sync_week' && rawArr.length === 7) {
    const mapped = (rawArr as SchedulePatternStoredSlot[]).map((slot) =>
      toInputSlot(slot, idToIndex, n),
    );
    if (mapped.length === 7) {
      syncPattern = mapped as CustomProgramForm['syncPattern'];
    }
  }

  for (let i = 0; i < 7; i++) {
    const s = syncPattern[i];
    if (s && s.type === 'workout' && s.workoutIndex >= n) {
      (syncPattern as unknown as ScheduleSlotInput[])[i] = { type: 'rest' };
    }
  }

  let asyncPattern: CustomProgramForm['asyncPattern'] = DEFAULT_ASYNC;
  if (kind === 'async_block' && rawArr.length > 0) {
    asyncPattern = (rawArr as SchedulePatternStoredSlot[]).map((slot) =>
      toInputSlot(slot, idToIndex, n),
    ) as CustomProgramForm['asyncPattern'];
  } else if (kind === 'async_block') {
    asyncPattern = DEFAULT_ASYNC;
  }

  return { scheduleKind: kind, syncPattern, asyncPattern, __workoutCount: ordered.length };
}

/** `PUT /programs/:id` expects `programWorkoutId` in each workout slot, not `workoutIndex` from the form. */
export function formInputPatternToStoredPattern(
  pattern: Array<{ type: 'rest' } | { type: 'workout'; workoutIndex: number }>,
  orderedWorkoutIds: string[],
): SchedulePatternStoredSlot[] {
  return pattern.map((s) => {
    if (s.type === 'rest') {
      return { type: 'rest' };
    }
    const id = orderedWorkoutIds[s.workoutIndex];
    if (!id) {
      return { type: 'rest' };
    }
    return { type: 'workout', programWorkoutId: id };
  });
}
