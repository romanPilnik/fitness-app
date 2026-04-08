# Design language

Hub: [AGENTS.md](../AGENTS.md)

**Product:** **OnlyFitness** — cohesive UI for a **mobile-first** web app. Mobile-first here means designing for small screens first, then enhancing for larger breakpoints using **Tailwind CSS 4** on the same React/Vite stack (not a native or alternate styling stack).

Constraint-based guidance so the UI stays cohesive. **`src/index.css`** currently defines global tokens (e.g. `--text`, `--text-h`, `--bg`, `--border`, `--accent`, `--shadow`, font stacks). Prefer these over ad hoc colors.

In **Tailwind class strings**, use the v4 shorthand that references those variables directly, e.g. `text-(--text)`, `text-(--text-h)`, `border-(--border)`, `bg-(--bg)` — not the heavier arbitrary form `text-[var(--text)]` (Tailwind IntelliSense will suggest the shorthand).

## Color

- **Text:** primary body `var(--text)` in CSS; in utilities prefer `text-(--text)`. Headings / emphasis: `var(--text-h)` or `text-(--text-h)`.
- **Background:** `var(--bg)` or `bg-(--bg)`; subtle panels can use `var(--code-bg)` / `bg-(--code-bg)` or `var(--social-bg)` where semantically fit.
- **Borders / dividers:** `var(--border)` or `border-(--border)`.
- **Accent / primary actions:** `var(--accent)` with `var(--accent-bg)` and `var(--accent-border)` for chips and focused states (utilities: `text-(--accent)`, `bg-(--accent-bg)`, `outline-(--accent-border)`, etc.).
- **Dark mode** follows `prefers-color-scheme` in `index.css` — new components should respect the same variables, not hard-code light-only colors.

## Typography

- Base font and line height come from `:root` (`font`, `letter-spacing`).
- **Headings:** use `h1` / `h2` styles as defined globally; avoid random `text-*` sizes for titles unless matching an existing scale.
- **Code / numeric UI:** `var(--mono)` for `code` and monospace contexts.

## Layout and rhythm

- **Mobile-first:** base styles target phone-sized viewports; use Tailwind breakpoints to widen grids, sidebars, and multi-column content on `md:` / `lg:` without forking components for “mobile vs desktop stacks.”
- **Page width:** `#root` uses max width + centered content — new layouts should align with that constraint or deliberately full-bleed with a documented reason.
- **Spacing:** favor consistent steps (Tailwind spacing scale) instead of arbitrary pixels.
- **Shadows:** use `var(--shadow)` for elevated surfaces rather than one-off box-shadows.

## Components

- **Buttons:** one primary style (accent), secondary outline neutral; disabled state lowered contrast; focus ring visible.
- **Forms:** labels above or beside fields; errors below fields with clear copy.
- **Density:** prefer breathable spacing on mobile; don’t cram controls below 44px touch targets for primary actions.

## Tone

- **Copy:** short, direct, action-oriented (OnlyFitness — workouts and progress).
- **Errors:** human-readable; map server `error.message` when present.

## Don’t

- Don’t introduce new primary accent hues per screen — extend the token set in `index.css` if a new semantic is needed.
- Don’t mix conflicting radii/shadows; reuse a small set of patterns.
