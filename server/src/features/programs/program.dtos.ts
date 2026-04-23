import {
  Difficulty,
  Goal,
  SplitType,
  ProgramSources,
  ProgramStatuses,
  ProgramScheduleKind,
} from "@/generated/prisma/enums";
import type { CursorPaginationParams } from "@/lib/pagination";
import type { SchedulePatternInputSlot, ScheduleSlot } from "./programSchedule.js";

export const programListSortValues = [
  "created_desc",
  "created_asc",
  "name_asc",
  "name_desc",
] as const;

export type ProgramListSort = (typeof programListSortValues)[number];

interface ProgramWorkoutExerciseDTO {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetWeight?: number;
  targetTotalReps?: number;
  targetTopSetReps?: number;
  targetRir?: number;
}

export interface ProgramWorkoutDTO {
  name: string;
  dayNumber: number;
  exercises: ProgramWorkoutExerciseDTO[];
}

export interface GetProgramsDTO extends CursorPaginationParams {
  userId: string;
  sort: ProgramListSort;
  status?: ProgramStatuses;
  difficulty?: Difficulty;
  goal?: Goal;
  splitType?: SplitType;
  createdFrom?: ProgramSources;
}

export interface GetActiveProgramDTO {
  userId: string;
}

export interface GetProgramByIdDTO {
  programId: string;
  userId: string;
}

export interface CreateFromTemplateDTO {
  userId: string;
  templateId: string;
  name?: string;
  startDate?: string;
  lengthWeeks?: number;
  /** Defaults to UTC; used when materializing calendar days. */
  timeZone?: string;
}

export interface CreateCustomProgramDTO {
  userId: string;
  name: string;
  description?: string;
  difficulty: Difficulty;
  goal: Goal;
  splitType: SplitType;
  daysPerWeek: number;
  startDate?: string;
  lengthWeeks?: number;
  scheduleKind: ProgramScheduleKind;
  /** Resolved after workouts are created (workoutIndex → id). */
  schedulePattern: SchedulePatternInputSlot[];
  timeZone?: string;
  workouts: ProgramWorkoutDTO[];
}

export interface UpdateProgramDTO {
  programId: string;
  userId: string;
  name?: string;
  description?: string;
  difficulty?: Difficulty;
  goal?: Goal;
  splitType?: SplitType;
  daysPerWeek?: number;
  status?: ProgramStatuses;
  startDate?: string;
  lengthWeeks?: number;
  scheduleKind?: ProgramScheduleKind;
  /** Stored JSON shape (UUIDs). */
  schedulePattern?: ScheduleSlot[];
  /** When updating schedule fields; defaults to UTC. */
  timeZone?: string;
}

export interface GetProgramOccurrencesDTO {
  programId: string;
  userId: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface GetNextWorkoutDTO {
  programId: string;
  userId: string;
  timeZone: string;
}

export interface PatchOccurrenceDTO {
  programId: string;
  occurrenceId: string;
  userId: string;
  timeZone: string;
  scheduledOn?: string;
  status?: "planned" | "skipped" | "cancelled";
}

export interface DeleteProgramDTO {
  programId: string;
  userId: string;
}

export interface AddProgramWorkoutDTO {
  programId: string;
  userId: string;
  name: string;
  dayNumber: number;
}

export interface UpdateProgramWorkoutDTO {
  programId: string;
  workoutId: string;
  userId: string;
  name?: string;
  dayNumber?: number;
}

export interface DeleteProgramWorkoutDTO {
  programId: string;
  workoutId: string;
  userId: string;
}

export interface AddWorkoutExerciseDTO {
  programId: string;
  workoutId: string;
  userId: string;
  exerciseId: string;
  order: number;
  targetSets: number;
  targetWeight?: number;
  targetTotalReps?: number;
  targetTopSetReps?: number;
  targetRir?: number;
}

export interface UpdateWorkoutExerciseDTO {
  programId: string;
  workoutId: string;
  workoutExerciseId: string;
  userId: string;
  order?: number;
  targetSets?: number;
  targetWeight?: number;
  targetTotalReps?: number;
  targetTopSetReps?: number;
  targetRir?: number;
}

export interface DeleteWorkoutExerciseDTO {
  programId: string;
  workoutId: string;
  workoutExerciseId: string;
  userId: string;
}

export interface BulkReorderWorkoutExercisesDTO {
  programId: string;
  workoutId: string;
  userId: string;
  exercises: { id: string; order: number }[];
}
