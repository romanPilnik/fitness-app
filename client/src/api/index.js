/**
 * API Module
 * Re-exports all API types, constants, and endpoints
 *
 * Usage:
 *   import { API, MUSCLE_GROUPS, buildUrl } from '@/api';
 *   // or
 *   import { API } from '@/api/endpoints';
 *   import { MUSCLE_GROUPS } from '@/api/types';
 */

// Endpoints and URL helpers
export { API, buildQueryString, buildUrl } from './endpoints';

// All type constants/enums
export {
  MUSCLE_GROUPS,
  EQUIPMENT_TYPES,
  EXERCISE_CATEGORIES,
  MOVEMENT_PATTERNS,
  SPLIT_TYPES,
  DIFFICULTY_LEVELS,
  PROGRAM_GOALS,
  PROGRAM_STATUS,
  SESSION_STATUS,
  COMPLETION_STATUS,
  SET_TYPES,
  UNIT_SYSTEMS,
  USER_ROLES,
  PERIODIZATION_TYPES,
  VOLUME_PROGRESSION_TYPES,
  ERROR_CODES,
} from './types';
