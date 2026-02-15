export const USER_ROLES = ['user', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const UNITS = ['metric', 'imperial'] as const;
export type Units = (typeof UNITS)[number];

export const WEEK_STARTS_ON = ['sunday', 'monday', 'saturday'] as const;
export type WeekStartsOn = (typeof WEEK_STARTS_ON)[number];

export const MUSCLE_GROUPS = [
  'chest',
  'back',
  'biceps',
  'triceps',
  'shoulders',
  'forearms',
  'quads',
  'hamstrings',
  'glutes',
  'calves',
  'abs',
  'traps',
  'lats',
] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const MOVEMENT_PATTERNS = [
  'horizontal_push', 
  'vertical_push', 
  'incline_push', 

  'horizontal_pull',
  'vertical_pull',

  'squat',
  'hip_hinge',

  'elbow_flexion',
  'elbow_extension',
  'side_shoulder_isolation',
  'rear_shoulder_isolation',
  'quad_isolation',
  'hamstring_isolation',
  'glute_isolation',
  'calf_isolation',

  'core',
  'carry',
] as const;
export type MovementPattern = (typeof MOVEMENT_PATTERNS)[number];

export const EQUIPMENT = [
  'barbell',
  'dumbbell',
  'cable',
  'machine',
  'bodyweight',
  'bands',
  'kettlebell',
  'none',
] as const;
export type Equipment = (typeof EQUIPMENT)[number];

export const EXERCISE_CATEGORIES = ['compound', 'isolation'] as const;
export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number];

export const PROGRESSION_TYPES = ['repetitions', 'weight', 'sets'] as const;
export type ProgressionType = (typeof PROGRESSION_TYPES)[number];

export const SPLIT_TYPES = [
  'full body',
  'push pull legs',
  'upper lower',
  'arnold',
  'modified full body',
  'other',
] as const;
export type SplitType = (typeof SPLIT_TYPES)[number];

export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const GOALS = ['strength', 'hypertrophy', 'endurance'] as const;
export type Goal = (typeof GOALS)[number];

export const PERIODIZATION_TYPES = ['linear_rir', 'dup', 'block'] as const;
export type PeriodizationType = (typeof PERIODIZATION_TYPES)[number];

export const VOLUME_PROGRESSIONS = ['static', 'ascending', 'wave'] as const;
export type VolumeProgression = (typeof VOLUME_PROGRESSIONS)[number];

export const PROGRAM_STATUSES = ['active', 'paused', 'completed'] as const;
export type ProgramStatus = (typeof PROGRAM_STATUSES)[number];

export const PROGRAM_SOURCES = ['template', 'scratch', 'shared'] as const;
export type ProgramSource = (typeof PROGRAM_SOURCES)[number];


export const SESSION_STATUSES = ['completed', 'partially', 'skipped'] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

export const SET_TYPES = [
  'straight set',
  'drop set',
  'super set',
  'myoreps',
  'myorep match',
  'giant set',
  'cluster set',
] as const;
export type SetType = (typeof SET_TYPES)[number];

export const REP_RANGES = ['2-4', '5-7', '8-11', '12-15'] as const;
export type RepRange = (typeof REP_RANGES)[number];
