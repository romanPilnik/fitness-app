const OVERRIDES: Record<string, string> = {
  ppl: 'Push / pull / legs',
  push_pull_legs: 'Push / pull / legs',
  upper_lower: 'Upper / lower',
  full_body: 'Full body',
  modified_full_body: 'Modified full body',
};

export function formatEnumLabel(raw: string | null | undefined): string {
  if (raw == null || raw === '') return '';
  const key = raw.toLowerCase();
  if (OVERRIDES[key]) return OVERRIDES[key];
  return raw
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function formatEnumList(values: string[]): string {
  return values.map((v) => formatEnumLabel(v)).join(', ');
}
