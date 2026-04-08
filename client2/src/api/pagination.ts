export type CursorPage<T> = {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
};

export const DEFAULT_LIST_LIMIT = 20;
