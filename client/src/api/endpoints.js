/**
 * API Endpoint Constants
 * Single source of truth for all API URLs
 */

const BASE_URL = '/api';
const V1 = `${BASE_URL}/v1`;

export const API = {
  // ============================================================================
  // AUTH
  // ============================================================================
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    REGISTER: `${BASE_URL}/auth/register`,
  },

  // ============================================================================
  // USERS
  // ============================================================================
  USERS: {
    ME: `${BASE_URL}/users/me`,
    CHANGE_PASSWORD: `${BASE_URL}/users/change-password`,
  },

  // ============================================================================
  // EXERCISES (Library)
  // ============================================================================
  EXERCISES: {
    LIST: `${V1}/exercises`,
    GET: (id) => `${V1}/exercises/${id}`,
    CREATE: `${V1}/exercises`, // Admin only
    UPDATE: (id) => `${V1}/exercises/${id}`, // Admin only
    DELETE: (id) => `${V1}/exercises/${id}`, // Admin only
  },

  // ============================================================================
  // EXERCISE PROFILES (User-specific exercise data)
  // ============================================================================
  EXERCISE_PROFILES: {
    LIST: `${V1}/profile/exercises`,
    GET: (exerciseId) => `${V1}/profile/exercises/${exerciseId}`,
    UPDATE: (exerciseId) => `${V1}/profile/exercises/${exerciseId}`,
  },

  // ============================================================================
  // PROGRAM TEMPLATES (Admin-created templates)
  // ============================================================================
  TEMPLATES: {
    LIST: `${V1}/programs/templates`,
    GET: (id) => `${V1}/programs/templates/${id}`,
    CREATE: `${V1}/programs/templates`, // Admin only
    UPDATE: (id) => `${V1}/programs/templates/${id}`, // Admin only
    DELETE: (id) => `${V1}/programs/templates/${id}`, // Admin only
  },

  // ============================================================================
  // USER PROGRAMS
  // ============================================================================
  PROGRAMS: {
    LIST: `${V1}/programs`,
    GET: (id) => `${V1}/programs/${id}`,
    ACTIVE: `${V1}/programs/active`,
    FROM_TEMPLATE: `${V1}/programs/from-template`,
    CUSTOM: `${V1}/programs/custom`,
    UPDATE: (id) => `${V1}/programs/${id}`,
    DELETE: (id) => `${V1}/programs/${id}`,
  },

  // ============================================================================
  // WORKOUT SESSIONS
  // ============================================================================
  SESSIONS: {
    LIST: `${V1}/sessions`,
    GET: (sessionId) => `${V1}/sessions/${sessionId}`,
    CREATE: `${V1}/sessions/create`,
    DELETE: (sessionId) => `${V1}/sessions/${sessionId}`,
  },
};

// ============================================================================
// QUERY PARAM HELPERS
// ============================================================================

/**
 * Build query string from filters object
 * @param {Object} filters
 * @returns {string}
 */
export function buildQueryString(filters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Build full URL with query params
 * @param {string} baseUrl
 * @param {Object} [filters]
 * @returns {string}
 */
export function buildUrl(baseUrl, filters = {}) {
  return `${baseUrl}${buildQueryString(filters)}`;
}

// ============================================================================
// ENDPOINT REFERENCE - Request & Response Shapes
// ============================================================================
// Note: Your axios interceptor unwraps responses, so you get the raw response
// object directly (not wrapped in axios response.data)
//
// All success responses have shape: { success: true, data: T, message?, pagination? }
// All error responses have shape:   { success: false, error: { message, code, details? } }
// ============================================================================

/**
 * @typedef {import('./types').SuccessResponse} SuccessResponse
 * @typedef {import('./types').ErrorResponse} ErrorResponse
 * @typedef {import('./types').Pagination} Pagination
 * @typedef {import('./types').User} User
 * @typedef {import('./types').AuthData} AuthData
 * @typedef {import('./types').Exercise} Exercise
 * @typedef {import('./types').ExerciseProfile} ExerciseProfile
 * @typedef {import('./types').ProgramTemplate} ProgramTemplate
 * @typedef {import('./types').UserProgram} UserProgram
 * @typedef {import('./types').WorkoutSession} WorkoutSession
 */

/**
 * ============================================================================
 * AUTH ENDPOINTS
 * ============================================================================
 *
 * POST /api/auth/login
 * --------------------
 * Request:  { email: string, password: string }
 * Response: { success: true, data: { token: string, user: { id, email, name } }, message }
 * Errors:   401 (invalid credentials), 400 (validation)
 *
 * POST /api/auth/register
 * -----------------------
 * Request:  { email: string, password: string, name: string }
 *           - email: valid email format, unique
 *           - password: 8-128 chars, at least one letter and one number
 *           - name: 2-50 chars
 * Response: { success: true, data: { token: string, user: { id, email, name } }, message }
 * Errors:   409 (duplicate email), 400 (validation)
 *
 * ============================================================================
 * USER ENDPOINTS (Auth required)
 * ============================================================================
 *
 * GET /api/users/me
 * -----------------
 * Request:  (none)
 * Response: { success: true, data: User, message }
 *           User: { _id, email, name, preferences: { units, weekStartsOn }, role, isActive, createdAt, updatedAt }
 *
 * PATCH /api/users/me
 * -------------------
 * Request:  { name?: string, preferences?: { units?: 'metric'|'imperial', weekStartsOn?: 0-6 } }
 * Response: { success: true, data: User, message }
 *
 * POST /api/users/change-password
 * -------------------------------
 * Request:  { oldPassword: string, newPassword: string }
 * Response: { success: true, data: null, message }
 * Errors:   401 (wrong old password), 400 (validation)
 *
 * ============================================================================
 * EXERCISE ENDPOINTS (Public GET, Admin POST/PATCH/DELETE)
 * ============================================================================
 *
 * GET /api/v1/exercises
 * ---------------------
 * Query:    { page?, limit?, muscle?, equipment?, category?, search? }
 *           - muscle: chest|back|biceps|triceps|shoulders|forearms|quads|hamstrings|glutes|calves|abs|traps|lats
 *           - equipment: barbell|dumbbell|cable|machine|bodyweight|bands|kettlebell|none
 *           - category: compound|isolation
 * Response: { success: true, data: Exercise[], pagination: { page, limit, total, totalPages } }
 *
 * GET /api/v1/exercises/:id
 * -------------------------
 * Response: { success: true, data: Exercise, message }
 * Errors:   404 (not found), 400 (invalid id)
 *
 * POST /api/v1/exercises (Admin)
 * ------------------------------
 * Request:  { name, equipment, primaryMuscle, secondaryMuscles?, category, movementPattern,
 *             typicalRepRange?: { min, max }, rirBoundaries?: { min, max },
 *             progressionType?, progressionIncrement?, instructions? }
 * Response: { success: true, data: Exercise, message } (201)
 * Errors:   409 (duplicate name), 403 (not admin)
 *
 * PATCH /api/v1/exercises/:id (Admin)
 * -----------------------------------
 * Request:  (any exercise field, partial update)
 * Response: { success: true, data: Exercise, message }
 *
 * DELETE /api/v1/exercises/:id (Admin)
 * ------------------------------------
 * Response: (204 No Content)
 *
 * ============================================================================
 * EXERCISE PROFILE ENDPOINTS (Auth required)
 * ============================================================================
 *
 * GET /api/v1/profile/exercises
 * -----------------------------
 * Query:    { page?, limit?, isFavorite?, needsFormCheck?, isInjuryModified? }
 * Response: { success: true, data: ExerciseProfile[], pagination }
 *           ExerciseProfile: { _id, userId, exerciseId, lastPerformed?, personalRecord?,
 *                              recentProgression?, recentSessions[], metrics?,
 *                              difficultyRating?, enjoymentRating?, formNotes?, injuryNotes?,
 *                              isActive, isFavorite, needsFormCheck, isInjuryModified }
 *
 * GET /api/v1/profile/exercises/:exerciseId
 * -----------------------------------------
 * Response: { success: true, data: ExerciseProfile, message }
 *
 * PATCH /api/v1/profile/exercises/:exerciseId
 * -------------------------------------------
 * Request:  { isFavorite?, needsFormCheck?, isInjuryModified?,
 *             difficultyRating?: 1-5, enjoymentRating?: 1-5,
 *             formNotes?: string (max 500), injuryNotes?: string (max 500) }
 * Response: { success: true, data: ExerciseProfile, message }
 *
 * ============================================================================
 * PROGRAM TEMPLATE ENDPOINTS (Public GET, Admin POST/PATCH/DELETE)
 * ============================================================================
 *
 * GET /api/v1/programs/templates
 * ------------------------------
 * Query:    { page?, limit?, splitType?, difficulty?, daysPerWeek?, search? }
 *           - splitType: 'full body'|'push pull legs'|'upper lower'|'arnold'|'modified full body'|'other'
 *           - difficulty: beginner|intermediate|advanced
 * Response: { success: true, data: ProgramTemplate[], pagination }
 *           ProgramTemplate: { _id, name, createdBy, splitType, daysPerWeek, difficulty,
 *                              goals[], description?, periodization, workouts[], isActive }
 *
 * GET /api/v1/programs/templates/:id
 * ----------------------------------
 * Response: { success: true, data: ProgramTemplate, message }
 *
 * POST /api/v1/programs/templates (Admin)
 * ---------------------------------------
 * Request:  { name, createdBy, splitType, daysPerWeek (1-14), difficulty, goals[],
 *             description?, periodization: { type, config: { weeks (1-12), rirProgression[], deloadWeek?, autoDeload?, volumeProgression } },
 *             workouts: [{ name, dayNumber, exercises: [{ exerciseId, targetSets, targetReps, targetRir, notes?, order }] }] }
 * Response: { success: true, data: ProgramTemplate, message } (201)
 *
 * PATCH /api/v1/programs/templates/:id (Admin)
 * --------------------------------------------
 * Request:  (any template field, partial update)
 * Response: { success: true, data: ProgramTemplate, message }
 *
 * DELETE /api/v1/programs/templates/:id (Admin)
 * ---------------------------------------------
 * Response: (204 No Content)
 *
 * ============================================================================
 * USER PROGRAM ENDPOINTS (Auth required)
 * ============================================================================
 *
 * GET /api/v1/programs
 * --------------------
 * Query:    { page?, limit?, status?: 'active'|'paused'|'completed' }
 * Response: { success: true, data: UserProgram[], pagination }
 *           UserProgram: { _id, userId, sourceTemplateId?, sourceTemplateName?, createdFrom,
 *                          name, description?, splitType, daysPerWeek, difficulty, goals[],
 *                          periodization, workouts[], status, startDate?, currentWeek,
 *                          nextWorkoutIndex, lastCompletedWorkoutDate?, hasBeenModified,
 *                          progressPercentage, weeksRemaining, isComplete }
 *
 * GET /api/v1/programs/active
 * ---------------------------
 * Response: { success: true, data: UserProgram | null, message }
 * Errors:   404 (no active program)
 *
 * GET /api/v1/programs/:id
 * ------------------------
 * Response: { success: true, data: UserProgram, message }
 * Errors:   404, 403 (not owner)
 *
 * POST /api/v1/programs/from-template
 * -----------------------------------
 * Request:  { templateId: string, startDate?: string,
 *             customizations?: { name?: string, workouts?: { [index]: { exercises: [...] } } } }
 * Response: { success: true, data: UserProgram, message } (201)
 * Errors:   404 (template not found), 409 (duplicate name)
 *
 * POST /api/v1/programs/custom
 * ----------------------------
 * Request:  { name, description?, difficulty, goals[], splitType, daysPerWeek, startDate?,
 *             periodization: { type, config }, workouts: [...] }
 * Response: { success: true, data: UserProgram, message } (201)
 *
 * PATCH /api/v1/programs/:id
 * --------------------------
 * Request:  { name?, description?, status?, currentWeek?, workouts?, ... }
 * Response: { success: true, data: UserProgram, message }
 *
 * DELETE /api/v1/programs/:id
 * ---------------------------
 * Response: (204 No Content)
 *
 * ============================================================================
 * WORKOUT SESSION ENDPOINTS (Auth required)
 * ============================================================================
 *
 * GET /api/v1/sessions
 * --------------------
 * Query:    { page?, limit? }
 * Response: { success: true, data: WorkoutSession[], pagination }
 *           WorkoutSession: { _id, userId, programId, workoutName, dayNumber,
 *                             sessionStatus, exercises[], datePerformed?, sessionDuration?,
 *                             notes?, algorithmNotes?, algorithmData?, isActive }
 *
 * GET /api/v1/sessions/:sessionId
 * -------------------------------
 * Response: { success: true, data: WorkoutSession, message }
 *
 * POST /api/v1/sessions/create
 * ----------------------------
 * Request:  { programId, workoutName, dayNumber?, sessionStatus: 'completed'|'partially'|'skipped',
 *             sessionDuration?: 0-600, notes?: string (max 999),
 *             exercises: [{ exerciseId, order, completionStatus,
 *                           sets: [{ setType, reps (1-100), weight (0-999), rir? (0-10) }],
 *                           feedback?: { reportedMMC?, reportedPump?, reportedTension?,
 *                                        reportedCardioFatigue?, reportedJointFatigue?, reportedSystemicFatigue? },
 *                           notes? }] }
 *           - setType: 'straight set'|'drop set'|'super set'|'myoreps'|'myorep match'|'giant set'|'cluster set'
 *           - feedback ratings: 1-5
 * Response: { success: true, data: WorkoutSession, message } (201)
 *
 * DELETE /api/v1/sessions/:sessionId
 * ----------------------------------
 * Response: (204 No Content)
 */
