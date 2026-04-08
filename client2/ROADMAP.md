# OnlyFitness — `client2/` roadmap

Single high-level map for implementing the **OnlyFitness** React SPA in `client2/` against the Express API in `../server/`. **Mobile-first** UI on the stack in [AGENTS.md](AGENTS.md) (Tailwind-first responsive layout; same stack for all viewports). **Stack facts, commands, and the JSON envelope** live in [AGENTS.md](AGENTS.md); **backend behavior and error codes** in [../server/AGENTS.md](../server/AGENTS.md). Use the topic index in [AGENTS.md](AGENTS.md) for day-to-day conventions.

---

## Purpose

- Give future agents a **complete picture** of API surface, suggested build order source tree, and major UI routes—without duplicating OpenAPI field lists.
- **Contract source of truth:** running server + Swagger at `GET /docs` (see [../server/src/app.ts](../server/src/app.ts)).

---

## Backend contract (client-facing)

All JSON responses use the server envelope ([../server/src/utils/response.ts](../server/src/utils/response.ts)): success `{ success: true, data, message? }`; errors `{ success: false, error: { message, code, details? } }`. Unwrap in one API layer; never assume the HTTP body is the entity without checking `success`.

| Area | Base path | Notes for client |
|------|-----------|------------------|
| Auth | `/api/v1/auth` | `POST /register`, `POST /login` (public; rate limited) |
| Users | `/api/v1/users` | `GET` / `PATCH /me`, `POST /change-password` (Bearer) |
| Exercises | `/api/v1/exercises` | `GET /`, `GET /:id` (public); `POST` + `DELETE /:id` **admin**; `PATCH /:id` authenticated, **user-owned** exercises only |
| Templates | `/api/v1/programs/templates` | `GET /`, `GET /:id` (public); `POST`, `PATCH`, `DELETE` (Bearer) |
| Programs | `/api/v1/programs` | List, detail, `GET /active`; `POST /from-template`, `POST /custom`; nested workouts/exercises + bulk reorder (Bearer) |
| Sessions | `/api/v1/sessions` | List, get, `POST` (log workout), delete (Bearer) |
| Exercise performance | `/api/v1/exercise-performance` | `GET /:exerciseId/performance` (Bearer, read-only) |
| Meta | `/health`, `/docs` | Liveness; Swagger UI |

**Pagination:** list endpoints use **cursor + `limit`**. Plan list UIs for **infinite scroll or “load more”**, not a single fixed page only.

**CORS / base URL:** server enables `cors()`. Configure `VITE_*` API base URL (and optional Vite dev proxy) in one place—see [docs/data-layer.md](docs/data-layer.md).

---

## Where to start (phased order)

Work top to bottom; each phase can be split into separate PRs/tasks.

- **Phase 0 — Shell:** `VITE_*` convention, Axios instance + **envelope unwrap**, `QueryClient` + provider in [docs/data-layer.md](docs/data-layer.md), React Router skeleton, global error/empty-state pattern.
- **Phase 1 — Auth:** Register/login pages, **one** token-storage strategy (see [docs/auth-routing.md](docs/auth-routing.md)), Bearer interceptor, `401` handling, `ProtectedRoute` (or equivalent).
- **Phase 2 — Read-heavy:** Exercise catalog + detail; template list + detail; program list + detail + active program; a minimal **home/dashboard** once those queries exist.
- **Phase 3 — Writes:** Program lifecycle (from template, custom, metadata edits, workout CRUD, exercise CRUD, reorder); template CRUD; **session logging** (largest payload—forms discipline); user profile + change password.
- **Phase 4 — Analytics / admin UX:** Exercise performance screen(s) (`exercise-performance`); optional **admin** surfaces for exercise library create/delete if the product needs them.

---

## React app outline (target `src/`)

Mirror [AGENTS.md](AGENTS.md) “Source layout (target)”:

```
src/
  api/                 # Axios instance, unwrap helpers, query client setup
  components/ui/       # Shared primitives (Tailwind, patterns)
  features/<domain>/   # api.ts, types.ts, schemas.ts, components/, pages/, hooks/
  layouts/             # App shell: sidebar / bottom nav (responsive)
  routes/              # Route tree, lazy-loaded pages
  lib/                 # cn(), small shared helpers
  hooks/               # Cross-feature hooks (sparingly)
```

Suggested **`<domain>`** folders: `auth`, `users`, `exercises`, `templates`, `programs`, `sessions`, `exercise-performance` (name to match API mental model). Keep **feature boundaries** per [docs/frontend-practices.md](docs/frontend-practices.md).

---

## Conceptual route map

Exact path strings are a product choice; every surface below should exist somewhere in the tree.

| URL (example) | Feature | Primary API(s) |
|---------------|---------|----------------|
| `/`, `/home` | Dashboard / next actions | `GET /programs/active`, recent `GET /sessions`, optional aggregates |
| `/login`, `/register` | Auth | `POST /auth/login`, `POST /auth/register` |
| `/exercises`, `/exercises/:id` | Exercise library | `GET /exercises`, `GET /exercises/:id` |
| `/exercises/:id/progress` | Per-exercise history / PR | `GET /exercise-performance/:exerciseId/performance` |
| `/templates`, `/templates/:id` | Templates (browse + detail) | `GET /programs/templates`, `GET /programs/templates/:id` |
| `/templates/new`, `/templates/:id/edit` | Template author | `POST` / `PATCH` / `DELETE` templates |
| `/programs`, `/programs/:id` | My programs | `GET /programs`, `GET /programs/:id`, `GET /programs/active` |
| `/programs/new`, `/programs/from-template` | Create flow | `POST /programs/custom`, `POST /programs/from-template` |
| `/programs/:id/...` | Program builder (workouts / exercises) | Nested program workout + exercise routes + reorder |
| `/sessions`, `/sessions/:id` | History / read-only log | `GET /sessions`, `GET /sessions/:id` |
| `/workouts/log`, `/sessions/new` | Log session | `POST /sessions` |
| `/account`, `/account/password` | Profile | `GET` / `PATCH /users/me`, `POST /users/change-password` |
| `*` | Not found | — |
| _(optional)_ `/admin/exercises` | Library admin | `POST /exercises`, `DELETE /exercises/:id` |

Public vs protected: align with server (e.g. library list/detail and template list/detail are readable without auth; mutations and user-specific data require Bearer).

---

## Cross-cutting practices

- **Forms & validation:** react-hook-form + Zod + `@hookform/resolvers` — [docs/forms-validation.md](docs/forms-validation.md). Especially important for **session create** and **program/template** payloads.
- **Layout & boundaries:** naming, where files go, no cross-feature deep imports — [docs/frontend-practices.md](docs/frontend-practices.md). **Hard deletes only** in UX when the API deletes.
- **Visual consistency:** tokens, typography, spacing — [docs/design-language.md](docs/design-language.md) and [docs/tailwind-ui.md](docs/tailwind-ui.md).
- **React / Vite:** [docs/react-vite.md](docs/react-vite.md). **TypeScript:** [docs/typescript.md](docs/typescript.md).

---

## What this file intentionally omits

- Full request/response field lists (use Swagger `/docs` or server validation files).
- New dependencies beyond [package.json](package.json) unless a task explicitly adds them.
- Long code samples—**one** shared unwrap pattern belongs in `src/api/` implementation, not here.

---

## Success check

An agent reading only this file should know: **which APIs exist**, **envelope + pagination expectations**, **build order**, **`src/` layout**, **major routes**, and **which `docs/` file to open next** for depth.
