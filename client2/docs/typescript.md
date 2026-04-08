# TypeScript, ESLint, Prettier

Hub: [AGENTS.md](../AGENTS.md)

## TypeScript

- **Strict mode is on** — see [`tsconfig.app.json`](../tsconfig.app.json) (`strict`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, etc.).
- Prefer **explicit types on public APIs** (exports, props, hook return shapes for non-trivial data). Let inference handle locals.
- Use **`import type`** for type-only imports when required by `verbatimModuleSyntax`.
- Avoid `any`; use `unknown` + narrowing if the shape is uncertain.
- **DOM / Vite:** `types` includes `vite/client`; use `import.meta.env` with a small typed wrapper when env vars are introduced.

## ESLint

- Config: [`eslint.config.js`](../eslint.config.js) — flat config, `typescript-eslint` **recommended**, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` (Vite).
- Run **`npm run lint`** from `client2/` after substantive edits.
- Fix new lint issues in the files you touch; do not silence rules without a short comment and a good reason.

## Prettier

- Prettier is a **devDependency**; a repo-level Prettier config may be added later.
- Keep formatting consistent with existing files; if Prettier is configured, run it on changed files before finishing.

## Don’t

- Don’t weaken `tsconfig` strictness to “make it compile.”
- Don’t add `@ts-expect-error` without a one-line reason tied to a real upstream limitation.
