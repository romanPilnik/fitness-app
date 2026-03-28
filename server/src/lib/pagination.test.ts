import { describe, expect, it } from "vitest";
import {
  buildCursorArgs,
  cursorPaginationSchema,
  paginateCursorResult,
} from "./pagination.js";

describe("cursorPaginationSchema", () => {
  it("defaults limit to 20 when omitted", () => {
    const r = cursorPaginationSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.limit).toBe(20);
  });

  it("coerces string limit to number", () => {
    const r = cursorPaginationSchema.safeParse({ limit: "5" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.limit).toBe(5);
  });

  it("accepts optional cursor", () => {
    const r = cursorPaginationSchema.safeParse({ cursor: "abc" });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.cursor).toBe("abc");
      expect(r.data.limit).toBe(20);
    }
  });

  it("rejects limit below 1", () => {
    expect(cursorPaginationSchema.safeParse({ limit: 0 }).success).toBe(false);
  });

  it("rejects limit above 100", () => {
    expect(cursorPaginationSchema.safeParse({ limit: 101 }).success).toBe(
      false,
    );
  });
});

describe("buildCursorArgs", () => {
  it("returns take limit+1 without cursor", () => {
    expect(buildCursorArgs({ limit: 10 })).toEqual({ take: 11 });
  });

  it("adds cursor and skip when cursor is set", () => {
    expect(buildCursorArgs({ cursor: "c1", limit: 20 })).toEqual({
      take: 21,
      cursor: { id: "c1" },
      skip: 1,
    });
  });
});

describe("paginateCursorResult", () => {
  const items = (n: number) =>
    Array.from({ length: n }, (_, i) => ({ id: `id-${String(i)}` }));

  it("returns empty page when no items", () => {
    expect(paginateCursorResult([], 10)).toEqual({
      data: [],
      nextCursor: null,
      hasMore: false,
    });
  });

  it("returns all items when at or under limit", () => {
    const three = items(3);
    expect(paginateCursorResult(three, 5)).toEqual({
      data: three,
      nextCursor: null,
      hasMore: false,
    });
  });

  it("truncates and sets nextCursor when more than limit", () => {
    const input = items(4);
    expect(paginateCursorResult(input, 3)).toEqual({
      data: input.slice(0, 3),
      nextCursor: "id-2",
      hasMore: true,
    });
  });
});
