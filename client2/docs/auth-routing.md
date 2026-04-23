# Auth routing (Better Auth)

Hub: [AGENTS.md](../AGENTS.md)

## Session

- **Server:** [`/api/auth/*`](../../server/src/app.ts) (Better Auth handler on the API origin).
- **Client:** [`src/lib/auth-client.ts`](../src/lib/auth-client.ts) — `baseURL` is the API **origin** only (see [`src/api/config.ts`](../src/api/config.ts)).
- **Cookies:** Session tokens are **HTTP-only** on the API host. Use **`withCredentials: true`** on Axios ([`src/api/client.ts`](../src/api/client.ts)) and on the Socket.IO client for features that need the same session.

## Public routes

| Path | Purpose |
|------|---------|
| `/login` | Email/password + Google |
| `/register` | Sign up |
| `/forgot-password` | Request password reset email |
| `/reset-password` | Set new password (`?token=` from email redirect) |

## Protected app shell

[`ProtectedRoute`](../src/routes/ProtectedRoute.tsx) wraps authed UI. Example account routes:

| Path | Purpose |
|------|---------|
| `/account` | Profile |
| `/account/password` | Change password (Better Auth `authClient.changePassword`) |
| `/account/devices` | List / revoke sessions |
| `/account/ai-preferences` | AI preferences |

## Errors (REST)

Unauthenticated requests to `/api/v1/*` return **`error.code`: `UNAUTHENTICATED`** (HTTP 401), not a Bearer token challenge — auth is cookie-based.

## Database (operators)

Schema changes live in [`server/prisma/schema.prisma`](../../server/prisma/schema.prisma). After pulling changes, run **`npx prisma migrate dev`** (or your deploy migrate) and **`npx prisma generate`** as needed so the client matches the schema.
