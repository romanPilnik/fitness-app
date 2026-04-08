# Frontend practices

Hub: [AGENTS.md](../AGENTS.md)

**OnlyFitness** UI is **mobile-first** within the documented React/Vite/Tailwind stack; keep one component tree and one set of styles (see [tailwind-ui.md](tailwind-ui.md), [design-language.md](design-language.md)).

## Where code goes

| Kind | Location |
|------|----------|
| Domain API calls, types, schemas | `src/features/<domain>/` |
| Route-only glue | `src/routes/` |
| App shell, nav | `src/layouts/` |
| Generic UI pieces | `src/components/ui/` |
| Axios, query client, API unwrap | `src/api/` |
| Pure helpers (`cn`, formatters) | `src/lib/` |

## Imports

- Prefer **relative imports** within a feature; use a **path alias** (`@/`) only after it is configured consistently in Vite + `tsconfig` (then prefer `@/features/...`, `@/components/...`).

## Naming

- **Components:** `PascalCase.tsx`.
- **Hooks:** `useThing.ts` / `useThing.tsx`.
- **Utils / api:** `camelCase` files (`api.ts`, `schemas.ts`).

## Boundaries

- **Features don’t import from sibling features’ internals** — only from shared `components/ui`, `lib`, `api`, or a deliberate **public** export if you add `index.ts` barrels.
- Avoid **circular imports**; extract shared types to `types.ts` or `src/types/` if needed.

## Deletion

- **Hard deletes** only in product behavior: deleting a user-owned resource means calling the API delete and removing it from caches/lists. No fake “deleted” state unless the API models it.

## Don’t

- Don’t create `utils/misc.ts` dumping grounds — name files by purpose.
- Don’t copy-paste server DTO shapes; generate or maintain **client types** beside the API layer and update when endpoints change.
