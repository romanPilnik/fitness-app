import {z} from 'zod';
import {
  MUSCLE_GROUPS,
  MOVEMENT_PATTERNS,
  EQUIPMENT,
  EXERCISE_CATEGORIES,
  SPLIT_TYPES,
  DIFFICULTIES,
  GOALS,
  PROGRAM_STATUSES,
  PROGRAM_SOURCES,
  SESSION_STATUSES,
  UNITS,
  WEEK_STARTS_ON,
} from '../types/enums.types.js';

// MongoDB ObjectId
export const objectId = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, 'Invalid ObjectId');

// Pagination
export const paginationQuery = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

// Exercise enums
export const muscleGroupEnum = z.enum(MUSCLE_GROUPS);
export const movementPatternEnum = z.enum(MOVEMENT_PATTERNS);
export const equipmentEnum = z.enum(EQUIPMENT);
export const exerciseCategoryEnum = z.enum(EXERCISE_CATEGORIES);

// Program enums
export const splitTypeEnum = z.enum(SPLIT_TYPES);
export const difficultyEnum = z.enum(DIFFICULTIES);
export const goalEnum = z.enum(GOALS);
export const programStatusEnum = z.enum(PROGRAM_STATUSES);
export const programSourceEnum = z.enum(PROGRAM_SOURCES);

// Session enums
export const sessionStatusEnum = z.enum(SESSION_STATUSES);

// User enums
export const unitsEnum = z.enum(UNITS);
export const weekStartsOnEnum = z.enum(WEEK_STARTS_ON);

// Password validation regex
export const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)/;

// Export types
export type ObjectId = z.infer<typeof objectId>;
export type MuscleGroup = z.infer<typeof muscleGroupEnum>;
export type MovementPattern = z.infer<typeof movementPatternEnum>;
export type Equipment = z.infer<typeof equipmentEnum>;
export type ExerciseCategory = z.infer<typeof exerciseCategoryEnum>;
export type SplitType = z.infer<typeof splitTypeEnum>;
export type Difficulty = z.infer<typeof difficultyEnum>;
export type Goal = z.infer<typeof goalEnum>;
export type ProgramStatus = z.infer<typeof programStatusEnum>;
export type ProgramSource = z.infer<typeof programSourceEnum>;
export type SessionStatus = z.infer<typeof sessionStatusEnum>;
export type Units = z.infer<typeof unitsEnum>;
export type WeekStartsOn = z.infer<typeof weekStartsOnEnum>;
