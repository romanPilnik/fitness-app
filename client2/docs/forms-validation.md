# Forms and validation

Hub: [AGENTS.md](../AGENTS.md)

## Stack

- **react-hook-form** for field state and submission.
- **Zod** for schemas (aligned with server Zod usage conceptually).
- **`@hookform/resolvers`** **`zodResolver`** to connect Zod to RHF.

## Practices

- Define **one schema per form** (or shared schema fragments in `features/<domain>/schemas.ts`).
- **Infer TS types** from Zod with `z.infer<typeof schema>` where helpful.
- Surface **server validation** (`error.details` / field errors) by mapping to `setError` on the right fields when the API returns structured validation failures.
- Prefer **uncontrolled** inputs with RHF `register` or **`Controller`** for controlled components; avoid duplicating state in `useState` unless necessary.
- **Submit buttons:** disable or show loading during `isSubmitting`; prevent double submit.

## Accessibility

- Associate **`label`** with inputs; announce errors with **`role="alert"`** or `aria-live` where appropriate.
- Don’t rely only on color to indicate errors.

## Don’t

- Don’t duplicate the same Zod rules in multiple forms without extracting a shared piece.
- Don’t bypass validation “just for the demo” — keep client and server rules aligned in spirit.
