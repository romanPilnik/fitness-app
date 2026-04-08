# Data layer (TanStack Query + Axios)

Hub: [AGENTS.md](../AGENTS.md)

## Principles

- **All HTTP** goes through a small **`src/api/`** layer: configured Axios instance, optional auth header injection, and helpers to **unwrap** the server envelope.
- **Server shape:** success `{ success: true, data }`, error `{ success: false, error: { message, code, details? } }` — see hub and [`server/AGENTS.md`](../../server/AGENTS.md).
- Use **HTTP status** together with body: 4xx/5xx may still include JSON `error`.

## TanStack Query

- One **`QueryClient`** for the app (provider in `main.tsx` or `App` when introduced).
- **Query keys:** arrays that include domain + params, e.g. `['programs', programId]`.
- **`queryFn`:** call typed API helpers that return **`data`** (already unwrapped) or throw a consistent `ApiError`.
- **Mutations:** use `onSuccess` to invalidate or update related queries; prefer `invalidateQueries` over hand-rolling cache patches unless performance demands it.
- Set reasonable **`staleTime`** for stable data (e.g. exercise catalog) vs volatile data (active session).

## Axios

- **`baseURL`** from `import.meta.env.VITE_*` (document the exact name in AGENTS when fixed).
- **Timeouts / cancel:** use `signal` from Query when applicable.
- **Errors:** normalize `AxiosError` + JSON body into a single error type for UI (toast, inline message).

## Don’t

- Don’t call `axios.get` scattered across components; centralize in `features/<domain>/api.ts` or `src/api/*`.
- Don’t assume the response body is the entity without checking `success === true`.
- Don’t cache sensitive data in `localStorage` unless explicitly required and reviewed under [auth-routing.md](auth-routing.md).
