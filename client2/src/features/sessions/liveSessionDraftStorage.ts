import { z } from 'zod';
import { logSessionFormSchema, type LogSessionForm } from './schemas';

const DRAFT_STORAGE_KEY = 'onlyfitness_live_session_draft_v1';

const draftBlobSchema = z.object({
  draftVersion: z.literal(1),
  userId: z.string().min(1),
  programId: z.string().min(1),
  programWorkoutId: z.string().min(1),
  sessionStartedAt: z.number().finite(),
  form: logSessionFormSchema,
});

export type LiveSessionDraftBlob = z.infer<typeof draftBlobSchema>;

function jsonReplacer(_key: string, value: unknown): unknown {
  if (typeof value === 'number' && !Number.isFinite(value)) {
    return 0;
  }
  return value;
}

export function readLiveSessionDraft(
  userId: string,
  programId: string,
  programWorkoutId: string,
): { form: LogSessionForm; sessionStartedAt: number } | null {
  if (!userId || !programId || !programWorkoutId) return null;
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    const blob = draftBlobSchema.safeParse(parsed);
    if (!blob.success) return null;
    const b = blob.data;
    if (
      b.userId !== userId ||
      b.programId !== programId ||
      b.programWorkoutId !== programWorkoutId
    ) {
      return null;
    }
    return { form: b.form, sessionStartedAt: b.sessionStartedAt };
  } catch {
    return null;
  }
}

export function writeLiveSessionDraft(payload: {
  userId: string;
  programId: string;
  programWorkoutId: string;
  sessionStartedAt: number;
  form: LogSessionForm;
}): void {
  const parsed = logSessionFormSchema.safeParse(payload.form);
  if (!parsed.success) return;

  try {
    const blob: LiveSessionDraftBlob = {
      draftVersion: 1,
      userId: payload.userId,
      programId: payload.programId,
      programWorkoutId: payload.programWorkoutId,
      sessionStartedAt: payload.sessionStartedAt,
      form: parsed.data,
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(blob, jsonReplacer));
  } catch {
    void 0;
  }
}

export function clearLiveSessionDraft(): void {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    void 0;
  }
}
