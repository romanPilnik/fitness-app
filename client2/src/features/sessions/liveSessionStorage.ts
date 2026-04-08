const STORAGE_KEY = 'onlyfitness_live_session_v1';

export type LiveSessionRef = {
  programId: string;
  programWorkoutId: string;
};

export function readLiveSessionRef(): LiveSessionRef | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    const o = parsed as Record<string, unknown>;
    const programId = o.programId;
    const programWorkoutId = o.programWorkoutId;
    if (
      typeof programId !== 'string' ||
      typeof programWorkoutId !== 'string' ||
      !programId ||
      !programWorkoutId
    ) {
      return null;
    }
    return { programId, programWorkoutId };
  } catch {
    return null;
  }
}

export function writeLiveSessionRef(ref: LiveSessionRef | null): void {
  try {
    if (ref == null) {
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ref));
    }
  } catch {
    void 0;
  }
}
