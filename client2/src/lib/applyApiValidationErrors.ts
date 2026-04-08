import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';
import { ApiError } from '@/api/errors';

export const API_VALIDATION_ERROR_CODE = 'VALIDATION_ERROR' as const;

type ZodLikeIssue = {
  path?: unknown;
  message?: unknown;
};

const LOCATION_PREFIXES = new Set(['body', 'query', 'params']);

function isZodLikeIssue(value: unknown): value is ZodLikeIssue {
  return typeof value === 'object' && value !== null;
}

function normalizePathSegments(path: unknown): string[] {
  if (!Array.isArray(path) || path.length === 0) return [];
  const rest = typeof path[0] === 'string' && LOCATION_PREFIXES.has(path[0]) ? path.slice(1) : path;
  return rest.map((p) => String(p));
}

export function applyApiValidationErrors<F extends FieldValues>(
  err: ApiError,
  setError: UseFormSetError<F>,
): boolean {
  if (err.code !== API_VALIDATION_ERROR_CODE || !Array.isArray(err.details)) {
    return false;
  }
  let applied = false;
  for (const raw of err.details) {
    if (!isZodLikeIssue(raw)) continue;
    const message = typeof raw.message === 'string' ? raw.message : 'Invalid value';
    const segments = normalizePathSegments(raw.path);
    if (segments.length === 0) continue;
    const key = segments.join('.') as FieldPath<F>;
    setError(key, { type: 'server', message });
    applied = true;
  }
  return applied;
}
