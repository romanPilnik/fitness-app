const DEFAULT_API_ORIGIN = 'http://localhost:5001';

/**
 * API server origin only (scheme + host + port). No path — REST uses `/api/v1` and
 * Better Auth uses `/api/auth` on top of this.
 *
 * If `VITE_API_BASE_URL` mistakenly includes a path (e.g. `.../api/v1`), we still
 * normalize to origin only. Otherwise Better Auth's client would not append `/api/auth`
 * and would POST to the wrong path (404 "Cannot POST /api/auth/...").
 */
export function getApiOrigin(): string {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (typeof raw === 'string' && raw.trim().length > 0) {
    try {
      return new URL(raw.trim()).origin;
    } catch {
      return DEFAULT_API_ORIGIN;
    }
  }
  return DEFAULT_API_ORIGIN;
}

export function getApiV1BaseUrl(): string {
  return `${getApiOrigin()}/api/v1`;
}
