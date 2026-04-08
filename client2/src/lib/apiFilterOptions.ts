export const MUSCLE_GROUP_VALUES = [
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

export const EQUIPMENT_VALUES = [
  'barbell',
  'dumbbell',
  'cable',
  'machine',
  'bodyweight',
  'bands',
  'kettlebell',
  'none',
] as const;

export const EXERCISE_CATEGORY_VALUES = ['compound', 'isolation'] as const;

export const MOVEMENT_PATTERN_VALUES = [
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

export const PROGRAM_STATUS_VALUES = ['active', 'paused', 'completed'] as const;

export const DIFFICULTY_VALUES = ['beginner', 'intermediate', 'advanced'] as const;

export const GOAL_VALUES = ['strength', 'hypertrophy', 'endurance'] as const;

export const SPLIT_TYPE_VALUES = [
  'full_body',
  'push_pull_legs',
  'upper_lower',
  'arnold',
  'modified_full_body',
  'other',
] as const;

export const PROGRAM_SOURCE_VALUES = ['template', 'scratch', 'shared'] as const;

export const SESSION_STATUS_VALUES = ['completed', 'partially', 'skipped'] as const;
