import { useMemo, type ReactNode } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import { WEEKDAY_LABELS_SUN0 } from '@/features/programs/scheduleDefaults';
import type { CustomProgramForm, EditProgramForm } from '@/features/programs/schemas';

/** Create + edit: same schedule UI; edit passes `workoutNames` instead of `workouts` on the form. */
export type ScheduleFormLike = Pick<
  CustomProgramForm,
  'lengthWeeks' | 'scheduleKind' | 'syncPattern' | 'asyncPattern'
>;

type SlotChoice = 'rest' | number;

function slotToChoice(
  slot: CustomProgramForm['syncPattern'][number],
  workoutCount: number,
): SlotChoice {
  if (slot.type === 'rest') return 'rest';
  return slot.workoutIndex < workoutCount ? slot.workoutIndex : 0;
}

/** Workouts (by list order) that never appear in the current week or block. */
function missingWorkoutLabelsFromPattern(
  pattern: readonly { type: string; workoutIndex?: number }[] | undefined,
  workoutCount: number,
  displayNames: string[],
): string[] {
  if (workoutCount < 1) {
    return [];
  }
  const used = new Set<number>();
  for (const s of pattern ?? []) {
    if (s.type === 'workout' && typeof s.workoutIndex === 'number' && s.workoutIndex < workoutCount) {
      used.add(s.workoutIndex);
    }
  }
  const out: string[] = [];
  for (let i = 0; i < workoutCount; i++) {
    if (!used.has(i)) {
      out.push(displayNames[i]?.trim() || `Workout ${i + 1}`);
    }
  }
  return out;
}

function formatNamesForSentence(names: string[]): string {
  if (names.length === 0) return '';
  if (names.length === 1) {
    return names[0]!;
  }
  if (names.length === 2) {
    return `${names[0]!} and ${names[1]!}`;
  }
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]!}`;
}

/** Shared shape for RHF: create has required `lengthWeeks`, edit has it optional. */
type ProgramScheduleFormValues = Pick<
  CustomProgramForm,
  'scheduleKind' | 'syncPattern' | 'asyncPattern'
> & {
  lengthWeeks?: number;
  workouts?: { name?: string }[];
  __workoutCount?: number;
};

export function ProgramScheduleFields({
  form: formProp,
  workoutNames: workoutNamesProp,
  includeLengthField = true,
}: {
  form: UseFormReturn<CustomProgramForm> | UseFormReturn<EditProgramForm>;
  /** When set (e.g. program edit), labels use this order; otherwise create form's `workouts` field. */
  workoutNames?: string[];
  /** New program includes length in this section; edit page keeps length in metadata. */
  includeLengthField?: boolean;
}) {
  const form = formProp as unknown as UseFormReturn<ProgramScheduleFormValues>;
  const workoutsFromForm = useWatch({ control: form.control, name: 'workouts' }) as
    | { name?: string }[]
    | undefined;
  const scheduleKind = useWatch({ control: form.control, name: 'scheduleKind' });
  const syncPattern = useWatch({ control: form.control, name: 'syncPattern' });
  const asyncPattern = useWatch({ control: form.control, name: 'asyncPattern' });
  const labelNames = useMemo((): string[] => {
    if (workoutNamesProp && workoutNamesProp.length > 0) {
      return workoutNamesProp;
    }
    return (workoutsFromForm?.map((w) => w.name?.trim()).filter(Boolean) as string[]) ?? [];
  }, [workoutNamesProp, workoutsFromForm]);
  const workoutCount = Math.max(1, labelNames.length);

  const activePattern = scheduleKind === 'sync_week' ? syncPattern : asyncPattern;
  const workoutsNotPlaced = useMemo(
    () => missingWorkoutLabelsFromPattern(activePattern, workoutCount, labelNames),
    [activePattern, workoutCount, labelNames],
  );
  const scheduleHint =
    scheduleKind === 'sync_week'
      ? 'Pick a day for each of them in the week above (you can use the same workout on more than one day if you like).'
      : 'Add each of them to your repeating steps above.';

  const onSyncSlotChange = (index: number, choice: string) => {
    const next = [...(syncPattern ?? [])];
    if (choice === 'rest') {
      next[index] = { type: 'rest' };
    } else {
      const wi = Number(choice);
      next[index] = { type: 'workout', workoutIndex: wi };
    }
    form.setValue('syncPattern', next as CustomProgramForm['syncPattern'], {
      shouldDirty: true,
    });
  };

  const onAsyncSlotChange = (index: number, choice: string) => {
    const next = [...(asyncPattern ?? [])];
    if (choice === 'rest') {
      next[index] = { type: 'rest' };
    } else {
      const wi = Number(choice);
      next[index] = { type: 'workout', workoutIndex: wi };
    }
    form.setValue('asyncPattern', next as CustomProgramForm['asyncPattern'], {
      shouldDirty: true,
    });
  };

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-(--border) p-4">
      <h2 className="text-lg font-medium text-(--text-h)">Length &amp; schedule</h2>
      {includeLengthField ? (
        <div className="flex flex-col gap-1">
          <label htmlFor="np-weeks" className="text-sm font-medium text-(--text-h)">
            Program length (weeks)
          </label>
          <input
            id="np-weeks"
            type="number"
            min={1}
            max={104}
            className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base"
            {...form.register('lengthWeeks', { valueAsNumber: true })}
          />
        </div>
      ) : null}
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-(--text-h)">Schedule type</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" value="sync_week" {...form.register('scheduleKind')} />
          Same weekdays each week (Sun–Sat grid)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" value="async_block" {...form.register('scheduleKind')} />
          Repeating block (e.g. train / train / rest — days shift on the calendar)
        </label>
      </fieldset>

      {scheduleKind === 'sync_week' ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-(--text)">One slot per weekday. Rest or which workout (by order above).</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {(syncPattern ?? []).map((slot, i) => (
              <div key={i} className="flex min-w-0 flex-col gap-1">
                <span className="text-xs font-medium text-(--text)">{WEEKDAY_LABELS_SUN0[i]}</span>
                <select
                  className="min-h-10 w-full rounded-lg border border-(--border) bg-(--bg) px-2 text-sm"
                  value={
                    slot.type === 'rest'
                      ? 'rest'
                      : String(slotToChoice(slot, workoutCount))
                  }
                  onChange={(e) => onSyncSlotChange(i, e.target.value)}
                >
                  <option value="rest">Rest</option>
                  {Array.from({ length: workoutCount }, (_, wi) => (
                    <option key={wi} value={wi}>
                      {labelNames[wi]?.trim() || `Workout ${wi + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-(--text)">
            Block repeats in order; each calendar day advances one slot in the block.
          </p>
          <div className="flex flex-wrap gap-2">
            <ButtonLike
              type="button"
              onClick={() => {
                const cur = form.getValues('asyncPattern') ?? [];
                form.setValue('asyncPattern', [...cur, { type: 'rest' }], { shouldDirty: true });
              }}
            >
              Add slot
            </ButtonLike>
            <ButtonLike
              type="button"
              onClick={() => {
                const cur = form.getValues('asyncPattern') ?? [];
                if (cur.length <= 1) return;
                form.setValue('asyncPattern', cur.slice(0, -1), { shouldDirty: true });
              }}
            >
              Remove last slot
            </ButtonLike>
          </div>
          <ul className="flex flex-col gap-2">
            {(asyncPattern ?? []).map((slot, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-8 text-xs text-(--text)">{i + 1}.</span>
                <select
                  className="min-h-10 flex-1 rounded-lg border border-(--border) bg-(--bg) px-2 text-sm"
                  value={slot.type === 'rest' ? 'rest' : String(slotToChoice(slot, workoutCount))}
                  onChange={(e) => onAsyncSlotChange(i, e.target.value)}
                >
                  <option value="rest">Rest</option>
                  {Array.from({ length: workoutCount }, (_, wi) => (
                    <option key={wi} value={wi}>
                      {labelNames[wi]?.trim() || `Workout ${wi + 1}`}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        </div>
      )}

      {workoutsNotPlaced.length > 0 ? (
        <div
          className="rounded-lg border border-amber-500/45 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-950/95 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-50/95"
          role="status"
        >
          <p className="font-medium text-amber-950 dark:text-amber-50">Some workouts are not on your plan yet</p>
          <p className="mt-1.5 text-xs leading-relaxed text-amber-900/90 dark:text-amber-100/90">
            {workoutsNotPlaced.length === 1 ? (
              <>
                <span className="font-medium">{workoutsNotPlaced[0]}</span> is not on your calendar, so you will
                not see it come up in your week until you add it. {scheduleHint}
              </>
            ) : (
              <>
                {formatNamesForSentence(workoutsNotPlaced)} are not on your calendar, so you will not see them
                come up in your week until you add them. {scheduleHint}
              </>
            )}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function ButtonLike({
  type,
  onClick,
  children,
}: {
  type: 'button';
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="min-h-9 rounded-lg border border-(--border) bg-(--code-bg)/40 px-3 text-sm font-medium text-(--text-h) hover:bg-(--code-bg)"
    >
      {children}
    </button>
  );
}
