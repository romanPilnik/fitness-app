import { deleteEnvelope, getEnvelope, postEnvelope } from '@/api/client';
import { DEFAULT_LIST_LIMIT, type CursorPage } from '@/api/pagination';
import type { SessionDetail, SessionSummary } from './types';

export const sessionQueryKeys = {
  all: ['sessions'] as const,
  list: (suffix?: string) => [...sessionQueryKeys.all, 'list', suffix ?? 'default'] as const,
  detail: (id: string) => [...sessionQueryKeys.all, 'detail', id] as const,
};

export type SessionListParams = {
  cursor?: string;
  limit?: number;
  sessionStatus?: string;
};

export async function fetchSessionsPage(
  params: SessionListParams = {},
): Promise<CursorPage<SessionSummary>> {
  const { cursor, limit = DEFAULT_LIST_LIMIT, sessionStatus } = params;
  return getEnvelope<CursorPage<SessionSummary>>('/sessions', {
    params: {
      ...(cursor ? { cursor } : {}),
      limit,
      ...(sessionStatus ? { sessionStatus } : {}),
    },
  });
}

export async function fetchSessionById(id: string): Promise<SessionDetail> {
  return getEnvelope<SessionDetail>(`/sessions/${encodeURIComponent(id)}`);
}

export type CreateSessionBody = {
  programId: string;
  workoutName: string;
  dayNumber: number;
  sessionStatus: string;
  sessionDuration: number;
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
