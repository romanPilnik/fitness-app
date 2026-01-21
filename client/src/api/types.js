/**
 * API Types and Constants
 * Single source of truth for frontend API contracts
 */

// ============================================================================
// ENUMS / CONSTANTS
// ============================================================================

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
];

export const EQUIPMENT_TYPES = [
  'barbell',
  'dumbbell',
  'cable',
  'machine',
  'bodyweight',
  'bands',
  'kettlebell',
  'none',
];

export const EXERCISE_CATEGORIES = ['compound', 'isolation'];

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
];

export const SPLIT_TYPES = [
  'full body',
  'push pull legs',
  'upper lower',
  'arnold',
  'modified full body',
  'other',
];

export const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];

export const PROGRAM_GOALS = ['strength', 'hypertrophy', 'endurance'];

export const PROGRAM_STATUS = ['active', 'paused', 'completed'];

export const SESSION_STATUS = ['completed', 'partially', 'skipped'];

export const COMPLETION_STATUS = ['completed', 'partially', 'skipped'];

export const SET_TYPES = [
  'straight set',
  'drop set',
  'super set',
  'myoreps',
  'myorep match',
  'giant set',
  'cluster set',
];

export const UNIT_SYSTEMS = ['metric', 'imperial'];

export const USER_ROLES = ['user', 'admin'];

export const PERIODIZATION_TYPES = ['linear_rir'];

export const VOLUME_PROGRESSION_TYPES = ['static'];

// ============================================================================
// ERROR CODES
// ============================================================================

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CAST_ERROR: 'CAST_ERROR',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  DUPLICATE_VALUE: 'DUPLICATE_VALUE',
  ERROR: 'ERROR',
};

// ============================================================================
// TYPE DEFINITIONS (JSDoc)
// ============================================================================

// --- Response Wrappers ---

/**
 * @typedef {Object} Pagination
 * @property {number} page
 * @property {number} limit
 * @property {number} total
 * @property {number} totalPages
 */

/**
 * @template T
 * @typedef {Object} SuccessResponse
 * @property {true} success
 * @property {T} data
 * @property {string} [message]
 * @property {Pagination} [pagination]
 */

/**
 * @typedef {Object} ValidationDetail
 * @property {string} field
 * @property {string} message
 */

/**
 * @typedef {Object} ApiError
 * @property {string} message
 * @property {string} code
 * @property {ValidationDetail[]} [details]
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {false} success
 * @property {ApiError} error
 */

// --- User ---

/**
 * @typedef {Object} UserPreferences
 * @property {'metric' | 'imperial'} units
 * @property {number} weekStartsOn - 0=Sunday, 1=Monday, ..., 6=Saturday
 */

/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} email
 * @property {string} name
 * @property {UserPreferences} preferences
 * @property {'user' | 'admin'} role
 * @property {boolean} isActive
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} AuthData
 * @property {string} token
 * @property {{ id: string, email: string, name: string }} user
 */

/**
 * @typedef {Object} LoginRequest
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} RegisterRequest
 * @property {string} email
 * @property {string} password
 * @property {string} name
 */

/**
 * @typedef {Object} UpdateUserRequest
 * @property {string} [name]
 * @property {Partial<UserPreferences>} [preferences]
 */

/**
 * @typedef {Object} ChangePasswordRequest
 * @property {string} oldPassword
 * @property {string} newPassword
 */

// --- Exercise ---

/**
 * @typedef {Object} RepRange
 * @property {number} min
 * @property {number} max
 */

/**
 * @typedef {Object} Exercise
 * @property {string} _id
 * @property {string} name
 * @property {string} equipment
 * @property {string} primaryMuscle
 * @property {string[]} secondaryMuscles
 * @property {'compound' | 'isolation'} category
 * @property {string} movementPattern
 * @property {RepRange} typicalRepRange
 * @property {RepRange} rirBoundaries
 * @property {string} progressionType
 * @property {number} progressionIncrement
 * @property {string} [instructions]
 * @property {boolean} isActive
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} ExerciseFilters
 * @property {number} [page]
 * @property {number} [limit]
 * @property {string} [muscle]
 * @property {string} [equipment]
 * @property {string} [category]
 * @property {string} [search]
 */

// --- Exercise Profile (User-specific) ---

/**
 * @typedef {Object} LastPerformed
 * @property {string} date
 * @property {number} weight
 * @property {number} reps
 * @property {number} sets
 */

/**
 * @typedef {Object} PersonalRecord
 * @property {number} weight
 * @property {number} reps
 * @property {string} date
 */

/**
 * @typedef {Object} RecentProgression
 * @property {number} attempts
 * @property {number} successes
 * @property {string} [lastProgressionDate]
 */

/**
 * @typedef {Object} RecentSession
 * @property {string} date
 * @property {number} topSetWeight
 * @property {number} topSetReps
 * @property {number} totalSets
 * @property {string} sessionId
 */

/**
 * @typedef {Object} BestWorkingSet
 * @property {string} repRange
 * @property {number} weight
 * @property {string} date
 */

/**
 * @typedef {Object} ExerciseMetrics
 * @property {number} avgDaysBetweenSessions
 * @property {number} totalSessions
 * @property {BestWorkingSet[]} bestWorkingSets
 */

/**
 * @typedef {Object} ExerciseProfile
 * @property {string} _id
 * @property {string} userId
 * @property {string} exerciseId
 * @property {LastPerformed} [lastPerformed]
 * @property {PersonalRecord} [personalRecord]
 * @property {RecentProgression} [recentProgression]
 * @property {RecentSession[]} recentSessions
 * @property {ExerciseMetrics} [metrics]
 * @property {number} [difficultyRating] - 1-5
 * @property {number} [enjoymentRating] - 1-5
 * @property {string} [formNotes]
 * @property {string} [injuryNotes]
 * @property {boolean} isActive
 * @property {boolean} isFavorite
 * @property {boolean} needsFormCheck
 * @property {boolean} isInjuryModified
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} UpdateExerciseProfileRequest
 * @property {boolean} [isFavorite]
 * @property {boolean} [needsFormCheck]
 * @property {boolean} [isInjuryModified]
 * @property {number} [difficultyRating] - 1-5
 * @property {number} [enjoymentRating] - 1-5
 * @property {string} [formNotes] - max 500 chars
 * @property {string} [injuryNotes] - max 500 chars
 */

// --- Program Template ---

/**
 * @typedef {Object} AutoDeloadConfig
 * @property {boolean} enabled
 * @property {number} triggerAfterFailures
 * @property {number} fatigueThreshold
 */

/**
 * @typedef {Object} PeriodizationConfig
 * @property {number} weeks - 1-12
 * @property {number[]} rirProgression - array length must match weeks
 * @property {number} [deloadWeek]
 * @property {AutoDeloadConfig} [autoDeload]
 * @property {string} volumeProgression
 */

/**
 * @typedef {Object} Periodization
 * @property {string} type
 * @property {PeriodizationConfig} config
 */

/**
 * @typedef {Object} WorkoutExercise
 * @property {string} exerciseId
 * @property {number} targetSets
 * @property {number} targetReps
 * @property {number} targetRir
 * @property {string} [notes]
 * @property {number} order
 */

/**
 * @typedef {Object} TemplateWorkout
 * @property {string} name
 * @property {number} dayNumber
 * @property {WorkoutExercise[]} exercises
 */

/**
 * @typedef {Object} ProgramTemplate
 * @property {string} _id
 * @property {string} name
 * @property {string} createdBy
 * @property {string} splitType
 * @property {number} daysPerWeek - 1-14
 * @property {string} difficulty
 * @property {string[]} goals
 * @property {string} [description]
 * @property {Periodization} periodization
 * @property {TemplateWorkout[]} workouts
 * @property {boolean} isActive
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} TemplateFilters
 * @property {number} [page]
 * @property {number} [limit]
 * @property {string} [splitType]
 * @property {string} [difficulty]
 * @property {number} [daysPerWeek]
 * @property {string} [search]
 */

// --- User Program ---

/**
 * @typedef {Object} UserProgram
 * @property {string} _id
 * @property {string} userId
 * @property {string} [sourceTemplateId]
 * @property {string} [sourceTemplateName]
 * @property {'template' | 'scratch' | 'shared'} createdFrom
 * @property {string} name
 * @property {string} [description]
 * @property {string} splitType
 * @property {number} daysPerWeek
 * @property {string} difficulty
 * @property {string[]} goals
 * @property {Periodization} periodization
 * @property {TemplateWorkout[]} workouts
 * @property {'active' | 'paused' | 'completed'} status
 * @property {string} [startDate]
 * @property {number} currentWeek
 * @property {number} nextWorkoutIndex
 * @property {string} [lastCompletedWorkoutDate]
 * @property {boolean} hasBeenModified
 * @property {number} progressPercentage - calculated
 * @property {number} weeksRemaining - calculated
 * @property {boolean} isComplete - calculated
 * @property {boolean} isActive
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} CreateProgramFromTemplateRequest
 * @property {string} templateId
 * @property {string} [startDate]
 * @property {Object} [customizations]
 * @property {string} [customizations.name]
 * @property {Object} [customizations.workouts] - keyed by workout index
 */

/**
 * @typedef {Object} CreateCustomProgramRequest
 * @property {string} name
 * @property {string} [description]
 * @property {string} difficulty
 * @property {string[]} goals
 * @property {string} splitType
 * @property {number} daysPerWeek
 * @property {string} [startDate]
 * @property {Periodization} periodization
 * @property {TemplateWorkout[]} workouts
 */

/**
 * @typedef {Object} ProgramFilters
 * @property {number} [page]
 * @property {number} [limit]
 * @property {string} [status]
 */

// --- Workout Session ---

/**
 * @typedef {Object} SetData
 * @property {string} setType
 * @property {number} reps - 1-100
 * @property {number} weight - 0-999
 * @property {number} [rir] - 0-10
 */

/**
 * @typedef {Object} ExerciseFeedback
 * @property {number} [reportedMMC] - 1-5
 * @property {number} [reportedPump] - 1-5
 * @property {number} [reportedTension] - 1-5
 * @property {number} [reportedCardioFatigue] - 1-5
 * @property {number} [reportedJointFatigue] - 1-5
 * @property {number} [reportedSystemicFatigue] - 1-5
 */

/**
 * @typedef {Object} SessionExercise
 * @property {string} exerciseId
 * @property {number} order
 * @property {'completed' | 'partially' | 'skipped'} completionStatus
 * @property {SetData[]} sets
 * @property {ExerciseFeedback} [feedback]
 * @property {string} [notes]
 */

/**
 * @typedef {Object} WorkoutSession
 * @property {string} _id
 * @property {string} userId
 * @property {string} programId
 * @property {string} workoutName
 * @property {number} dayNumber
 * @property {'completed' | 'partially' | 'skipped'} sessionStatus
 * @property {SessionExercise[]} exercises
 * @property {string} [datePerformed]
 * @property {number} [sessionDuration] - 0-600 minutes
 * @property {string} [notes] - max 999 chars
 * @property {string} [algorithmNotes]
 * @property {Object} [algorithmData]
 * @property {boolean} isActive
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} CreateSessionRequest
 * @property {string} programId
 * @property {string} workoutName
 * @property {number} [dayNumber]
 * @property {'completed' | 'partially' | 'skipped'} sessionStatus
 * @property {SessionExercise[]} exercises
 * @property {number} [sessionDuration]
 * @property {string} [notes]
 */

/**
 * @typedef {Object} SessionFilters
 * @property {number} [page]
 * @property {number} [limit]
 */
