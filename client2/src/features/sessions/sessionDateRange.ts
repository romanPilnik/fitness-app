export type SessionDatePreset = 'all' | 'last7' | 'last30' | 'custom';

function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

/**
 * Maps UI date preset + optional custom YYYY-MM-DD bounds to ISO strings for the sessions API.
 */
export function sessionDateRangeToApiParams(
  preset: SessionDatePreset,
  customFrom: string,
  customTo: string,
): { dateFrom?: string; dateTo?: string } {
  if (preset === 'all') {
    return {};
  }

  const now = new Date();

  if (preset === 'last7') {
    const from = new Date(now);
    from.setDate(from.getDate() - 7);
    return {
      dateFrom: startOfLocalDay(from).toISOString(),
      dateTo: endOfLocalDay(now).toISOString(),
    };
  }

  if (preset === 'last30') {
    const from = new Date(now);
    from.setDate(from.getDate() - 30);
    return {
      dateFrom: startOfLocalDay(from).toISOString(),
      dateTo: endOfLocalDay(now).toISOString(),
    };
  }

  if (!customFrom.trim() || !customTo.trim()) {
    return {};
  }
  const fromParts = customFrom.split('-').map(Number);
  const toParts = customTo.split('-').map(Number);
  if (fromParts.length !== 3 || toParts.length !== 3) {
    return {};
  }
  const [fy, fm, fd] = fromParts;
  const [ty, tm, td] = toParts;
  if (
    fy === undefined ||
    fm === undefined ||
    fd === undefined ||
    ty === undefined ||
    tm === undefined ||
    td === undefined
  ) {
    return {};
  }
  const fromDate = new Date(fy, fm - 1, fd);
  const toDate = new Date(ty, tm - 1, td);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return {};
  }
  if (fromDate > toDate) {
    return {};
  }
  return {
    dateFrom: startOfLocalDay(fromDate).toISOString(),
    dateTo: endOfLocalDay(toDate).toISOString(),
  };
}
