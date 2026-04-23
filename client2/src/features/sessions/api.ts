import { deleteEnvelope, getEnvelope, postEnvelope } from '@/api/client';
import { DEFAULT_LIST_LIMIT, type CursorPage } from '@/api/pagination';
import type { SessionDetail, SessionSummary } from './types';

/** Filters included in list query keys (scope separates e.g. dashboard vs history). */
export type SessionListFiltersKey = {
  sessionStatus?: string;
  programId?: string;
  dateFrom?: string;
  dateTo?: string;
};

export const sessionQueryKeys = {
  all: ['sessions'] as const,
  list: (scope: string, filters: SessionListFiltersKey = {}) =>
    [...sessionQueryKeys.all, 'list', scope, filters] as const,
  detail: (id: string) => [...sessionQueryKeys.all, 'detail', id] as const,
  generatedTargets: (programWorkoutId: string) =>
    ['generated-targets', programWorkoutId] as const,
};

export type SessionListParams = {
  cursor?: string;
  limit?: number;
  sessionStatus?: string;
  programId?: string;
  dateFrom?: string;
  dateTo?: string;
};

export async function fetchSessionsPage(
  params: SessionListParams = {},
): Promise<CursorPage<SessionSummary>> {
  const {
    cursor,
    limit = DEFAULT_LIST_LIMIT,
    sessionStatus,
    programId,
    dateFrom,
    dateTo,
  } = params;
  return getEnvelope<CursorPage<SessionSummary>>('/sessions', {
    params: {
      ...(cursor ? { cursor } : {}),
      limit,
      ...(sessionStatus ? { sessionStatus } : {}),
      ...(programId ? { programId } : {}),
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
    },
  });
}

/** Loads all sessions in `[dateFrom, dateTo]` via cursor pagination (max 100 per page). */
export async function fetchAllSessionsInDateRange(params: {
  dateFrom: string;
  dateTo: string;
  sessionStatus?: string;
  programId?: string;
}): Promise<SessionSummary[]> {
  const limit = 100;
  const all: SessionSummary[] = [];
  let cursor: string | undefined;
  for (;;) {
    const page = await fetchSessionsPage({ ...params, limit, cursor });
    all.push(...page.data);
    if (!page.hasMore || !page.nextCursor) break;
    cursor = page.nextCursor;
  }
  return all;
}

export async function fetchSessionById(id: string): Promise<SessionDetail> {
  return getEnvelope<SessionDetail>(`/sessions/${encodeURIComponent(id)}`);
}

export type CreateSessionBody = {
  programId: string;
  programWorkoutId: string;
  workoutName: string;
  dayNumber: number;
  sessionStatus: string;
  sessionDuration: number;
  occurrenceId?: string;
  datePerformed?: string;
  timeZone?: string;
  /** YYYY-MM-DD in the user's local calendar — used to link planned occurrences. */
  performedOnLocalDate?: string;
  exercises: Array<{
    exerciseId: string;
    order: number;
    targetSets: number;
    targetWeight?: number;
    targetTotalReps?: number;
    targetTopSetReps?: number;
    targetRir?: number;
    sets: Array<{
      targetWeight?: number;
      targetReps?: number;
      reps: number;
      weight: number;
      rir: number;
      setCompleted: boolean;
    }>;
  }>;
};

export async function createSession(body: CreateSessionBody): Promise<SessionDetail> {
  return postEnvelope<SessionDetail>('/sessions', body);
}

export async function deleteSession(id: string): Promise<void> {
  return deleteEnvelope(`/sessions/${encodeURIComponent(id)}`);
}

export interface GeneratedTargetsResponse {
  generatedWorkoutId: string;
  createdAt: string;
  exercises: Array<{
    exerciseId: string;
    order: number;
    targetSets: number;
    targetRir: number | null;
    notes: string | null;
    sets: Array<{
      setNumber: number;
      targetWeight: number;
      targetReps: number;
      targetRir: number | null;
    }>;
  }>;
}

export async function fetchGeneratedTargets(
  programWorkoutId: string,
): Promise<GeneratedTargetsResponse> {
  return getEnvelope<GeneratedTargetsResponse>(
    `/generated-targets/${encodeURIComponent(programWorkoutId)}`,
  );
}
