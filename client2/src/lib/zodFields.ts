import { z } from 'zod';

function preprocessNumericInput(v: unknown): number {
  if (v === '' || v == null) return NaN;
  if (typeof v === 'string') return Number(v);
  if (typeof v === 'number') return v;
  return NaN;
}

export function intField(min: number, max: number) {
  return z.preprocess(preprocessNumericInput, z.number().int().min(min).max(max));
}

export function intFieldMin(min: number) {
  return z.preprocess(preprocessNumericInput, z.number().int().min(min));
}
