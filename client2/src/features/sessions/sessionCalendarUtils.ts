import type { SessionSummary } from './types';

/** Calendar day key in local timezone (YYYY-MM-DD). */
export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseIsoToLocalDateKey(iso: string): string {
  return localDateKey(new Date(iso));
}

export function startOfLocalMonth(year: number, monthIndex: number): Date {
  return new Date(year, monthIndex, 1, 0, 0, 0, 0);
}

export function endOfLocalMonth(year: number, monthIndex: number): Date {
  return new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
}

/** ISO bounds for GET /sessions `dateFrom` / `dateTo` covering the whole local month. */
export function monthToApiRange(year: number, monthIndex: number): { dateFrom: string; dateTo: string } {
  return {
    dateFrom: startOfLocalMonth(year, monthIndex).toISOString(),
    dateTo: endOfLocalMonth(year, monthIndex).toISOString(),
  };
}

export function aggregateSessionsByLocalDay(
  sessions: SessionSummary[],
): Map<string, SessionSummary[]> {
  const map = new Map<string, SessionSummary[]>();
  for (const s of sessions) {
    const key = parseIsoToLocalDateKey(s.datePerformed);
    const list = map.get(key);
    if (list) list.push(s);
    else map.set(key, [s]);
  }
  for (const list of map.values()) {
    list.sort((a, b) => new Date(b.datePerformed).getTime() - new Date(a.datePerformed).getTime());
  }
  return map;
}

export type CalendarCell =
  | { kind: 'padding' }
  | { kind: 'day'; date: Date; dateKey: string; isToday: boolean; isFuture: boolean };

/**
 * Builds a fixed 6-row (42 cell) grid for `year`/`monthIndex`, Monday-first.
 * Trailing cells after the last day of month are padding (still in grid but not selectable as in-month content — we use padding only at start in this implementation; for end we use padding cells too).
 */
export function buildMonthGrid(year: number, monthIndex: number, now: Date = new Date()): CalendarCell[] {
  const first = startOfLocalMonth(year, monthIndex);
  const lastDay = endOfLocalMonth(year, monthIndex).getDate();
  const startOffset = (first.getDay() + 6) % 7; // Monday = 0
  const cells: CalendarCell[] = [];

  for (let i = 0; i < startOffset; i++) {
    cells.push({ kind: 'padding' });
  }

  const todayKey = localDateKey(now);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, monthIndex, day, 12, 0, 0, 0);
    const dateKey = localDateKey(date);
    const dayStart = new Date(year, monthIndex, day).getTime();
    const isFuture = dayStart > todayStart;
    cells.push({
      kind: 'day',
      date,
      dateKey,
      isToday: dateKey === todayKey,
      isFuture,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ kind: 'padding' });
  }
  while (cells.length < 42) {
    cells.push({ kind: 'padding' });
  }

  return cells;
}

export const WEEKDAY_LABELS_MON_FIRST = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export function formatDayDialogTitle(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatMonthYear(year: number, monthIndex: number): string {
  return new Date(year, monthIndex, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

export function badgeCount(n: number): string {
  if (n <= 0) return '';
  return n > 9 ? '9+' : String(n);
}
