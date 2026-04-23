import { BadRequestError } from "@/errors/index.js";
import { ERROR_CODES } from "@/types/error.types.js";
import { Prisma } from "@/generated/prisma/client.js";
import { ProgramScheduleKind } from "@/generated/prisma/enums.js";
import { formatInTimeZone } from "date-fns-tz";

export interface ScheduleRestSlot {
  type: "rest";
}
export interface ScheduleWorkoutSlot {
  type: "workout";
  programWorkoutId: string;
}
export type ScheduleSlot = ScheduleRestSlot | ScheduleWorkoutSlot;

/** Create-program body: pattern references workouts array index before IDs exist. */
export interface ScheduleWorkoutIndexSlot {
  type: "workout";
  workoutIndex: number;
}
export type SchedulePatternInputSlot = ScheduleRestSlot | ScheduleWorkoutIndexSlot;

function parseYmdParts(label: string, dateKey: string): { y: number; mo: number; d: number } {
  const parts = dateKey.split("-").map(Number);
  const y = parts[0];
  const mo = parts[1];
  const d = parts[2];
  if (
    y === undefined ||
    mo === undefined ||
    d === undefined ||
    Number.isNaN(y) ||
    Number.isNaN(mo) ||
    Number.isNaN(d)
  ) {
    throw new BadRequestError(
      `Invalid ${label} date key: ${dateKey}`,
      ERROR_CODES.INVALID_INPUT,
    );
  }
  return { y, mo, d };
}

export function resolveSchedulePatternFromIndices(
  pattern: SchedulePatternInputSlot[],
  workoutIdsInOrder: string[],
): ScheduleSlot[] {
  return pattern.map((slot) => {
    if (slot.type === "rest") return { type: "rest" };
    const id = workoutIdsInOrder[slot.workoutIndex];
    if (!id) {
      throw new BadRequestError(
        `Invalid workoutIndex ${String(slot.workoutIndex)} in schedule pattern`,
        ERROR_CODES.INVALID_INPUT,
      );
    }
    return { type: "workout", programWorkoutId: id };
  });
}

/** Sunday = 0 … Saturday = 6 */
export function weekdaySun0FromDateKey(dateKey: string): number {
  const { y, mo, d } = parseYmdParts("dateKey", dateKey);
  return new Date(Date.UTC(y, mo - 1, d, 12, 0, 0)).getUTCDay();
}

/** Gregorian calendar day + delta (no timezone ambiguity). */
export function addCalendarDays(dateKey: string, delta: number): string {
  const { y, mo, d } = parseYmdParts("dateKey", dateKey);
  const ms = Date.UTC(y, mo - 1, d) + delta * 86_400_000;
  const x = new Date(ms);
  const yy = x.getUTCFullYear();
  const mm = String(x.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(x.getUTCDate()).padStart(2, "0");
  return `${String(yy)}-${mm}-${dd}`;
}

export function startDateKeyInTimeZone(startDate: Date, timeZone: string): string {
  return formatInTimeZone(startDate, timeZone, "yyyy-MM-dd");
}

export function dateKeyToDbDate(dateKey: string): Date {
  const { y, mo, d } = parseYmdParts("dateKey", dateKey);
  return new Date(Date.UTC(y, mo - 1, d, 12, 0, 0));
}

export function isScheduleSlot(x: unknown): x is ScheduleSlot {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  if (o.type === "rest") return true;
  if (o.type === "workout" && typeof o.programWorkoutId === "string")
    return o.programWorkoutId.length > 0;
  return false;
}

export function parseSchedulePatternJson(raw: unknown): ScheduleSlot[] {
  if (!Array.isArray(raw)) return [];
  const out: ScheduleSlot[] = [];
  for (const el of raw) {
    if (isScheduleSlot(el)) out.push(el);
  }
  return out;
}

/**
 * Default training weekday indices (Sun=0): spread `daysPerWeek` sessions across the week.
 */
const TRAINING_INDICES_BY_DPW: Record<number, number[]> = {
  1: [3],
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 3, 4],
  6: [0, 1, 2, 3, 4, 5],
  7: [0, 1, 2, 3, 4, 5, 6],
};

export function buildDefaultSyncPattern(
  orderedProgramWorkoutIds: string[],
  daysPerWeek: number,
): ScheduleSlot[] {
  if (orderedProgramWorkoutIds.length === 0) return [];
  const days = TRAINING_INDICES_BY_DPW[daysPerWeek];
  if (!days) {
    throw new BadRequestError(
      "daysPerWeek must be between 1 and 7 for default sync pattern",
      ERROR_CODES.INVALID_INPUT,
    );
  }
  const pattern: ScheduleSlot[] = Array.from(
    { length: 7 },
    (): ScheduleRestSlot => ({ type: "rest" }),
  );
  const n = orderedProgramWorkoutIds.length;
  days.forEach((dow, i) => {
    const w = orderedProgramWorkoutIds[i % n];
    if (w === undefined) {
      throw new BadRequestError(
        "Internal: empty program workout list in default sync pattern",
        ERROR_CODES.INVALID_INPUT,
      );
    }
    const at = pattern[dow];
    if (at === undefined) {
      throw new BadRequestError(
        "Internal: invalid DOW in default pattern",
        ERROR_CODES.INVALID_INPUT,
      );
    }
    pattern[dow] = { type: "workout", programWorkoutId: w };
  });
  return pattern;
}

export function validateSchedulePattern(
  kind: ProgramScheduleKind,
  pattern: ScheduleSlot[],
  validProgramWorkoutIds: Set<string>,
): void {
  if (pattern.length === 0) {
    throw new BadRequestError(
      "schedulePattern must not be empty",
      ERROR_CODES.INVALID_INPUT,
    );
  }
  if (kind === ProgramScheduleKind.sync_week && pattern.length !== 7) {
    throw new BadRequestError(
      "sync_week schedulePattern must have exactly 7 slots (Sun–Sat)",
      ERROR_CODES.INVALID_INPUT,
    );
  }
  if (kind === ProgramScheduleKind.async_block && pattern.length < 1) {
    throw new BadRequestError(
      "async_block schedulePattern must have at least 1 slot",
      ERROR_CODES.INVALID_INPUT,
    );
  }
  for (const slot of pattern) {
    if (slot.type === "workout" && !validProgramWorkoutIds.has(slot.programWorkoutId)) {
      throw new BadRequestError(
        "schedulePattern references an unknown program workout",
        ERROR_CODES.INVALID_INPUT,
      );
    }
  }
}

export interface MaterializeParams {
  programId: string;
  lengthWeeks: number;
  scheduleKind: ProgramScheduleKind;
  schedulePattern: ScheduleSlot[];
  startDate: Date;
  timeZone: string;
}

export function buildOccurrenceCreateMany(
  p: MaterializeParams,
): Prisma.ProgramWorkoutOccurrenceCreateManyInput[] {
  /** Consecutive civil days from the program’s local `startDate` (not an ISO “week from Sunday”). */
  const totalDays = Math.max(1, p.lengthWeeks) * 7;
  const startKey = startDateKeyInTimeZone(p.startDate, p.timeZone);
  const rows: Prisma.ProgramWorkoutOccurrenceCreateManyInput[] = [];

  if (p.scheduleKind === ProgramScheduleKind.sync_week) {
    for (let i = 0; i < totalDays; i++) {
      const dateKey = addCalendarDays(startKey, i);
      const dow = weekdaySun0FromDateKey(dateKey);
      const slot = p.schedulePattern[dow];
      if (!slot || slot.type === "rest") continue;
      rows.push({
        programId: p.programId,
        programWorkoutId: slot.programWorkoutId,
        scheduledOn: dateKeyToDbDate(dateKey),
        status: "planned",
      });
    }
    return rows;
  }

  const plen = p.schedulePattern.length;
  if (plen === 0) {
    throw new BadRequestError(
      "Internal: empty schedule pattern in async block",
      ERROR_CODES.INVALID_INPUT,
    );
  }

  for (let i = 0; i < totalDays; i++) {
    const dateKey = addCalendarDays(startKey, i);
    const slot = p.schedulePattern[i % plen];
    if (slot === undefined) {
      throw new BadRequestError(
        "Internal: schedule pattern index out of range",
        ERROR_CODES.INVALID_INPUT,
      );
    }
    if (slot.type === "rest") continue;
    rows.push({
      programId: p.programId,
      programWorkoutId: slot.programWorkoutId,
      scheduledOn: dateKeyToDbDate(dateKey),
      status: "planned",
    });
  }
  return rows;
}
