# Auth and protected UI

Hub: [AGENTS.md](../AGENTS.md)

## Backend

- Auth endpoints: **`/api/v1/auth`** (register, login, etc.) — see [`server/AGENTS.md`](../../server/AGENTS.md).
- Protected routes use JWT **`Authorization: Bearer <token>`** (confirm exact header shape from server auth responses when implementing).

## Token handling (choose one convention and document it in AGENTS)

Until the app standardizes, pick a single approach and update the hub:

1. **Memory-only** token + refresh (most secure against XSS theft of persistent storage; harder to survive full reload without refresh endpoint).
2. **`sessionStorage`** or **`localStorage`** (simpler; higher XSS risk — mitigate with CSP and careful dependency hygiene).

**Don’t mix strategies** across the codebase.

## Axios

- **Request interceptor:** attach Bearer token when present.
- **Response interceptor:** on `401`, clear session and redirect to login (watch for infinite retry loops).

## Routing

- **`ProtectedRoute`** (or route `loader`): if no valid session, redirect to `/login` (or equivalent) with return URL when appropriate.
- Keep **public** routes (login, register) free of auth requirements.
- **Don’t** gate routes only in the UI while leaving API calls unprotected — the server is authoritative; the client mirrors for UX.

## Don’t

- Don’t log tokens or passwords.
- Don’t put JWTs in URLs or analytics events.
