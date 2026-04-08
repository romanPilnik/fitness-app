import { z } from 'zod';
import { intFieldMin } from '@/lib/zodFields';

function optIntMin0() {
  return z.preprocess(
    (v) => (v === '' || v == null ? undefined : typeof v === 'string' ? Number(v) : (v as number)),
    z.number().int().min(0).optional(),
  );
}

const sessionSetSchema = z.object({
  targetWeight: optIntMin0(),
  targetReps: optIntMin0(),
  reps: intFieldMin(0),
  weight: intFieldMin(0),
  rir: optIntMin0(),
  setCompleted: z.boolean(),
});

const sessionExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  exerciseName: z.string().optional(),
  order: intFieldMin(1),
  targetSets: intFieldMin(1),
  targetWeight: optIntMin0(),
  targetTotalReps: optIntMin0(),
  targetTopSetReps: optIntMin0(),
  targetRir: optIntMin0(),
  sets: z.array(sessionSetSchema).min(1),
});

export const logSessionFormSchema = z.object({
  programId: z.string().min(1),
  workoutName: z.string().max(35).trim().min(1),
  dayNumber: intFieldMin(1),
  sessionStatus: z.enum(['completed', 'partially', 'skipped']),
  exercises: z.array(sessionExerciseSchema).min(1),
});

export type LogSessionForm = z.infer<typeof logSessionFormSchema>;

export function deriveSessionStatusFromSets(
  exercises: LogSessionForm['exercises'],
): LogSessionForm['sessionStatus'] {
  const allSets = exercises.flatMap((ex) => ex.sets);
  if (allSets.length === 0) return 'skipped';
  const done = allSets.filter((s) => s.setCompleted).length;
  if (done === allSets.length) return 'completed';
  if (done === 0) return 'skipped';
  return 'partially';
}
