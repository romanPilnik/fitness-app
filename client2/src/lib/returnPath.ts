export function safeReturnPath(from: unknown, fallback = '/home'): string {
  if (typeof from !== 'string') return fallback;
  if (!from.startsWith('/') || from.startsWith('//')) return fallback;
  return from;
}
