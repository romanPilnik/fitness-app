# Server

Node.js REST API (Express, TypeScript, Prisma, PostgreSQL). See the monorepo root `CLAUDE.md` for context.

## Testing

**Runner:** Vitest — `npm run test` (watch), `npm run test:run` (CI-style), `npm run test:coverage`.

**Config:** [vitest.config.ts](vitest.config.ts) — Node environment, glob `src/**/*.test.ts`, alias `@` → `src`, setup [src/test/setup.ts](src/test/setup.ts) (loads `.env.test` first).

### HTTP harness (Supertest)

- Import **`testAgent`** only from HTTP-style specs (e.g. `*.http.test.ts`): [src/test/httpAgent.ts](src/test/httpAgent.ts).
- End-to-end smoke: [src/test/health.smoke.http.test.ts](src/test/health.smoke.http.test.ts) (`GET /health`).
- Optional later: if request logs are too noisy under test, set `NODE_ENV=test` and tune [src/middlewares/httpLogger.middleware.ts](src/middlewares/httpLogger.middleware.ts) / Pino.

### Auth helpers (protected routes)

Central utilities: [src/test/authHelpers.ts](src/test/authHelpers.ts).

- **`bearerAuth(token)`** — `{ Authorization: 'Bearer …' }` for `.set(...)` (the API does not use cookies for JWT).
- **`mintBearerAuth(userId)`** — JWT signed with `JWT_SECRET` for an existing user id (middleware still loads the user from the DB).
- **`registerTestUser(agent, overrides?)`** — `POST /api/v1/auth/register` with unique email by default; returns `token`, `user`, and credentials.
- **`loginTestUser(agent, email, password)`** — `POST /api/v1/auth/login`.

**Env:** Copy [.env.test.example](.env.test.example) to `.env.test`, run commands from `server/`. HTTP tests that load [src/app.ts](src/app.ts) need a valid `DATABASE_URL` (see [src/config/config.ts](src/config/config.ts)).

**Rate limiting:** Auth routes skip the login/register limiter when `process.env.VITEST === "true"` so suites are not capped at 10 requests per window.

### Layout and style

- Feature unit specs: `src/features/<domain>/__tests__/`.
- Shared modules: colocated `*.test.ts` under `middlewares`, `validations`, `utils`, etc.
- Prefer **`*.http.test.ts`** for Supertest files next to the feature when testing that domain’s routes.

**Unit vs HTTP:** Unit tests avoid the full app and DB where possible. Supertest specs hit the real stack; use a dedicated test database in `DATABASE_URL` when exercising Prisma.

### Integration tests (Postgres + Prisma)

**When:** Specs in `src/**/*.integration.test.ts` hit the real DB (truncate between tests). **Not** part of `npm run test:run`; use **`npm run test:integration`**.

**Docker test DB:** [docker-compose.yml](docker-compose.yml) defines **`db_test`** — Postgres on host port **5433**, database **`fitness_app_test`**, same `admin` / `myPassword` as `db`.

**One-time / local workflow** (from `server/`):

1. `npm run db:test:up` (or `docker compose up -d db_test`)
2. Copy [.env.test.example](.env.test.example) → `.env.test` if you do not have it yet (**must** use port **5433** and DB **`fitness_app_test`** for Compose).
3. `npm run db:test:migrate` (`prisma migrate deploy` with `.env.test`)
4. `npm run test:integration`

Optional: **`npm run seed:test`** loads [src/scripts/seed.ts](src/scripts/seed.ts) against `.env.test` (manual / exploratory; global truncate in integration tests clears data each test).

**Implementation notes:** [vitest.integration.config.ts](vitest.integration.config.ts) (`fileParallelism: false`), [src/test/integration.setup.ts](src/test/integration.setup.ts) (`TRUNCATE … CASCADE`), main [vitest.config.ts](vitest.config.ts) excludes `*.integration.test.ts`.
