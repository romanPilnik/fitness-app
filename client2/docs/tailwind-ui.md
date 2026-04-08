# Tailwind CSS and UI building blocks

Hub: [AGENTS.md](../AGENTS.md)

**OnlyFitness** is **mobile-first** on this stack: layout and components are authored with **Tailwind 4 utilities** (and global tokens in `index.css`), not a separate mobile framework or native UI layer.

## Tailwind 4

- Dependencies: `tailwindcss`, `@tailwindcss/vite` — wire the Vite plugin in [`vite.config.ts`](../vite.config.ts) when using Tailwind in the bundle (see Tailwind 4 + Vite docs).
- Prefer **utility classes** for layout and spacing; extract components when the same cluster of classes repeats **three or more times** or when semantics demand a name.
- Use **`clsx`** + **`tailwind-merge`** for conditional classes; a shared `cn()` helper in `src/lib/utils.ts` is recommended once introduced.

## Components

- **`components/ui/`** — small, reusable primitives (buttons, inputs, cards) with minimal domain knowledge.
- **Feature-specific styling** lives next to the feature (`features/<domain>/components/`).

## Accessibility

- Interactive elements must be **keyboard reachable** and have **visible focus** where applicable.
- Use semantic HTML (`button`, `nav`, `label` + `htmlFor`) before ARIA attributes.
- Icon-only controls need **`aria-label`** (or visually hidden text).

## Responsive

- **Mobile-first is mandatory:** default classes = small screens; add `sm:`, `md:`, `lg:` only to **enhance** for larger widths. The stack stays **React + Vite + Tailwind** — responsive behavior is expressed in utilities, not by introducing another styling system for phones.
- Touch targets should be large enough for mobile (roughly 44px minimum for primary taps).

## Don’t

- Don’t invent one-off hex colors for every screen; align with [design-language.md](design-language.md) and CSS variables where defined.
- Don’t mix large custom CSS in component files when utilities would keep the system consistent—use `index.css` for global tokens and resets only.
