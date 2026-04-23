/** Sun=0 … Sat=6; matches server `programSchedule` training spread. */
const TRAINING_INDICES_BY_DPW: Record<number, number[]> = {
  1: [3],
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 3, 4],
  6: [0, 1, 2, 3, 4, 5],
  7: [0, 1, 2, 3, 4, 5, 6],
};

export type ScheduleSlotInput =
  | { type: 'rest' }
  | { type: 'workout'; workoutIndex: number };

export function defaultSyncPattern(workoutCount: number, daysPerWeek: number): ScheduleSlotInput[] {
  const days = TRAINING_INDICES_BY_DPW[daysPerWeek] ?? [0, 2, 4];
  const pattern: ScheduleSlotInput[] = Array.from({ length: 7 }, () => ({ type: 'rest' as const }));
  days.forEach((dow, i) => {
    pattern[dow] = {
      type: 'workout',
      workoutIndex: i % Math.max(1, workoutCount),
    };
  });
  return pattern;
}

export const WEEKDAY_LABELS_SUN0 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
