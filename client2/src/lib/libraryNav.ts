/** Pass on `Link` / `navigate` when routing from the library hub. */
export const libraryLocationState = { from: '/library' as const };

export function isFromLibraryState(state: unknown): boolean {
  if (typeof state !== 'object' || state === null) return false;
  return (state as { from?: string }).from === '/library';
}
