import { z } from 'zod';
import { intField, intFieldMin } from '@/lib/zodFields';

export const difficulty = z.enum(['beginner', 'intermediate', 'advanced']);
export const goal = z.enum(['strength', 'hypertrophy', 'endurance']);
export const splitType = z.enum([
  'full_body',
  'push_pull_legs',
  'upper_lower',
  'arnold',
  'modified_full_body',
  'other',
]);
export const programStatus = z.enum(['active', 'paused', 'completed']);

const programWorkoutExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  order: intFieldMin(1),
  targetSets: intFieldMin(1),
  targetWeight: z.preprocess(
    (v) => (v === '' || v == null ? undefined : typeof v === 'string' ? Number(v) : (v as number)),
    z.number().optional(),
  ),
  targetTotalReps: z.preprocess(
    (v) => (v === '' || v == null ? undefined : typeof v === 'string' ? Number(v) : (v as number)),
    z.number().int().optional(),
  ),
  targetTopSetReps: z.preprocess(
    (v) => (v === '' || v == null ? undefined : typeof v === 'string' ? Number(v) : (v as number)),
    z.number().int().optional(),
  ),
  targetRir: z.preprocess(
    (v) => (v === '' || v == null ? undefined : typeof v === 'string' ? Number(v) : (v as number)),
    z.number().int().optional(),
  ),
});

const programWorkoutSchema = z.object({
  name: z.string().max(50).trim().min(1),
  dayNumber: intField(1, 14),
  exercises: z.array(programWorkoutExerciseSchema).min(1),
});

export const fromTemplateFormSchema = z.object({
  templateId: z.string().min(1),
  name: z.string().max(50).trim().optional(),
  startDate: z.string().optional(),
});

export type FromTemplateForm = z.infer<typeof fromTemplateFormSchema>;

const scheduleSlotInputSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('rest') }),
  z.object({
    type: z.literal('workout'),
    workoutIndex: z.number().int().min(0),
  }),
]);

export const customProgramFormSchema = z
  .object({
    name: z.string().max(50).trim().min(1),
    description: z.string().max(500).trim().optional(),
    difficulty,
    goal,
    splitType,
    daysPerWeek: intField(1, 14),
    startDate: z.string().trim().min(1, 'Start date is required'),
    lengthWeeks: intField(1, 104),
    scheduleKind: z.enum(['sync_week', 'async_block']),
    syncPattern: z.array(scheduleSlotInputSchema).length(7),
    asyncPattern: z.array(scheduleSlotInputSchema).min(1),
    workouts: z.array(programWorkoutSchema).min(1),
  })
  .superRefine((data, ctx) => {
    const n = data.workouts.length;
    const checkSlots = (slots: { type: string; workoutIndex?: number }[], path: 'syncPattern' | 'asyncPattern') => {
      for (let i = 0; i < slots.length; i++) {
        const s = slots[i];
        if (s.type === 'workout' && s.workoutIndex !== undefined && s.workoutIndex >= n) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Workout index must be between 0 and ${n - 1}`,
            path: [path, i],
          });
        }
      }
    };
    checkSlots(data.syncPattern, 'syncPattern');
    checkSlots(data.asyncPattern, 'asyncPattern');
  });

export type CustomProgramForm = z.infer<typeof customProgramFormSchema>;

export const editProgramMetadataSchema = z.object({
  name: z.string().max(50).trim().optional(),
  description: z.string().max(500).trim().optional(),
  difficulty: difficulty.optional(),
  goal: goal.optional(),
  splitType: splitType.optional(),
  daysPerWeek: z.preprocess((v) => {
    if (v === '' || v == null) return undefined;
    return typeof v === 'string' ? Number(v) : (v as number);
  }, z.number().int().min(1).max(14).optional()),
  lengthWeeks: z.preprocess((v) => {
    if (v === '' || v == null) return undefined;
    return typeof v === 'string' ? Number(v) : (v as number);
  }, z.number().int().min(1).max(104).optional()),
  status: programStatus.optional(),
  startDate: z.string().optional(),
});

export type EditProgramMetadataForm = z.infer<typeof editProgramMetadataSchema>;

/** Edit program page: metadata + weekly / block schedule (mirrors create flow). */
export const editProgramFormSchema = editProgramMetadataSchema
  .extend({
    scheduleKind: z.enum(['sync_week', 'async_block']),
    syncPattern: z.array(scheduleSlotInputSchema).length(7),
    asyncPattern: z.array(scheduleSlotInputSchema).min(1),
    __workoutCount: z.coerce.number().int().min(0),
  })
  .superRefine((data, ctx) => {
    const n = data.__workoutCount;
    if (n < 1) return;
    const checkSlots = (
      slots: { type: string; workoutIndex?: number }[],
      path: 'syncPattern' | 'asyncPattern',
    ) => {
      for (let i = 0; i < slots.length; i++) {
        const s = slots[i];
        if (s.type === 'workout' && s.workoutIndex !== undefined && s.workoutIndex >= n) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Workout index must be between 0 and ${n - 1}`,
            path: [path, i],
          });
        }
      }
    };
    checkSlots(data.syncPattern, 'syncPattern');
    checkSlots(data.asyncPattern, 'asyncPattern');
  });

export type EditProgramForm = z.infer<typeof editProgramFormSchema>;

export const addWorkoutFormSchema = z.object({
  name: z.string().max(50).trim().min(1),
  dayNumber: intField(1, 14),
});

export type AddWorkoutForm = z.infer<typeof addWorkoutFormSchema>;

export const editWorkoutFormSchema = z.object({
  name: z.string().max(50).trim().min(1).optional(),
  dayNumber: z.preprocess((v) => {
    if (v === '' || v == null) return undefined;
    return typeof v === 'string' ? Number(v) : (v as number);
  }, z.number().int().min(1).max(14).optional()),
});

export const addExerciseSlotSchema = z.object({
  exerciseId: z.string().min(1),
  order: intFieldMin(1),
  targetSets: intFieldMin(1),
  targetWeight: z.preprocess(
    (v) => (v === '' || v == null ? undefined : typeof v === 'string' ? Number(v) : (v as number)),
    z.number().optional(),
  ),
  targetTotalReps: z.preprocess(
    (v) => (v === '' || v == null ? undefined : typeof v === 'string' ? Number(v) : (v as number)),
    z.number().int().optional(),
  ),
  targetTopSetReps: z.preprocess(
    (v) => (v === '' || v == null ? undefined : typeof v === 'string' ? Number(v) : (v as number)),
    z.number().int().optional(),
  ),
  targetRir: z.preprocess(
    (v) => (v === '' || v == null ? undefined : typeof v === 'string' ? Number(v) : (v as number)),
    z.number().int().optional(),
  ),
});

export type AddExerciseSlotForm = z.infer<typeof addExerciseSlotSchema>;

export const editExerciseSlotSchema = z.object({
  order: z.preprocess((v) => {
    if (v === '' || v == null) return undefined;
    return typeof v === 'string' ? Number(v) : (v as number);
  }, z.number().int().min(1).optional()),
  targetSets: z.preprocess((v) => {
    if (v === '' || v == null) return undefined;
    return typeof v === 'string' ? Number(v) : (v as number);
  }, z.number().int().min(1).optional()),
  targetWeight: z.preprocess((v) => {
    if (v === '' || v == null) return null;
    return typeof v === 'string' ? Number(v) : (v as number | null);
  }, z.number().nullable().optional()),
  targetTotalReps: z.preprocess((v) => {
    if (v === '' || v == null) return null;
    return typeof v === 'string' ? Number(v) : (v as number | null);
  }, z.number().int().nullable().optional()),
  targetTopSetReps: z.preprocess((v) => {
    if (v === '' || v == null) return null;
    return typeof v === 'string' ? Number(v) : (v as number | null);
  }, z.number().int().nullable().optional()),
  targetRir: z.preprocess((v) => {
    if (v === '' || v == null) return null;
    return typeof v === 'string' ? Number(v) : (v as number | null);
  }, z.number().int().nullable().optional()),
});

export type EditExerciseSlotForm = z.infer<typeof editExerciseSlotSchema>;
