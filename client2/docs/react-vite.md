# React and Vite

Hub: [AGENTS.md](../AGENTS.md)

## React 19

- Prefer **function components** and hooks; no class components.
- Keep components **small and focused**; lift state only when multiple children need it.
- **Lists:** stable `key` from ids, not array index (unless static read-only lists).
- **Effects:** minimal `useEffect`; prefer event handlers and derived state. Document dependencies honestly; avoid empty-deps hacks that hide bugs.
- **StrictMode** is enabled in [`main.tsx`](../src/main.tsx) — expect double render in dev for effect discovery.

## Vite 8

- Config: [`vite.config.ts`](../vite.config.ts).
- **Env:** only `VITE_*` variables are exposed to the client bundle.
- **Assets:** use `import` for bundled assets; `public/` for files that keep exact paths.
- Do not rely on Node-only APIs in browser code.

## React Router 7

- Prefer **route objects** or a single route tree module under `src/routes/` (see hub layout).
- Use **nested routes** for layouts (shell + outlet) when the app grows.
- **Loaders / actions:** use when they simplify data loading; align with TanStack Query (avoid duplicating cache logic).

## React Refresh

- ESLint **react-refresh** rules apply; avoid patterns that break fast refresh (e.g. anonymous component exports in files that mix too many concerns) — follow lint guidance.

## Don’t

- Don’t fetch inside render; use Query hooks or loaders + Query cache updates.
- Don’t put business logic that belongs in `features/<domain>/` into generic `components/ui/`.
