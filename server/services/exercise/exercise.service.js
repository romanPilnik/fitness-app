const Exercise = require("../../models/Exercise");
const { parsePaginationParams, calculatePagination } = require("../../utils/pagination");

/**
 * Exercise Service
 * Handles all business logic for exercise operations
 * 
 * TODO/Improvements:
 * 1. Exercise Data Enhancement:
 *    - Add exercise difficulty calculation based on movement complexity
 *    - Include video/image references for proper form
 *    - Add exercise variations and alternatives
 *    - Include safety precautions and common mistakes
 *    - Support multiple languages for instructions
 * 
 * 2. Advanced Filtering:
 *    - Filter by multiple muscle groups
 *    - Filter by movement patterns
 *    - Filter by equipment availability
 *    - Support compound filters (AND/OR operations)
 *    - Filter by exercise complexity/difficulty
 * 
 * 3. Exercise Relationships:
 *    - Track exercise dependencies (prerequisites)
 *    - Implement progression paths
 *    - Link related exercises (variations/alternatives)
 *    - Support exercise supersets/combinations
 *    - Track commonly paired exercises
 * 
 * 4. Performance Optimization:
 *    - Implement caching for frequently accessed exercises
 *    - Add query result caching
 *    - Support partial updates
 *    - Implement batch operations
 *    - Add field selection options
 * 
 * 5. Analytics & Tracking:
 *    - Track exercise popularity
 *    - Monitor usage patterns
 *    - Track user feedback and ratings
 *    - Collect form check submissions
 *    - Analyze common modifications
 * 
 * 6. Validation & Safety:
 *    - Validate exercise combinations
 *    - Check for balanced muscle targeting
 *    - Validate progression patterns
 *    - Implement form check validation
 *    - Add exercise contraindications
 * 
 * 7. Integration Features:
 *    - Connect with external exercise databases
 *    - Support exercise data import/export
 *    - Integrate with video platforms
 *    - Support equipment linking
 *    - Enable trainer annotations
 * 
 * 8. Missing Features:
 *    - Exercise categorization by skill level
 *    - Warm-up/cool-down requirements
 *    - Exercise timing/tempo guidance
 *    - Alternative movement patterns
 *    - Equipment substitution logic
 */

/**
 * Get exercises with optional filters and pagination
 * @param {Object} filters - Query filters (muscle, equipment, category)
 * @param {Object} options - Query options including pagination and search
 * @param {number} [options.page] - Page number for pagination
 * @param {number} [options.limit] - Items per page
 * @param {string} [options.q] - Search query string
 * @returns {Promise<{exercises: Array, count: number, pagination: Object}>}
 */
const getExercises = async (filters = {}, options = {}) => {
  try {
    const queryFilters = {
      isActive: true,
      ...filters,
    };

    const { page, limit, skip } = parsePaginationParams(options || {});
    const textFilter = options && options.q ? { $text: { $search: options.q } } : {};
    const query = { ...queryFilters, ...textFilter };

    const exercises = await Exercise.find(query)
      .select("-__v")
      .skip(skip)
      .limit(limit)
      .lean();

    const count = await Exercise.countDocuments(query);

    return {
      exercises,
      count,
      pagination: calculatePagination(page, limit, count),
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get a specific exercise by ID
 * @param {string} id - Exercise ID
 * @returns {Promise<Object>} Exercise document
 * @throws {Error} When exercise not found or invalid ID
 */
const getExerciseById = async (id) => {
  try {
    const exercise = await Exercise.findById(id);
    return exercise;
  } catch (error) {
    if (error.name === "CastError") {
      const customError = new Error("Invalid exercise ID format");
      customError.type = "VALIDATION_ERROR";
      throw customError;
    }
    throw error;
  }
};

/**
 * Create a new exercise
 * @param {Object} exerciseData - Exercise data
 * @param {string} exerciseData.name - Exercise name
 * @param {string} exerciseData.equipment - Equipment type
 * @param {string} exerciseData.primaryMuscle - Primary muscle worked
 * @param {string[]} [exerciseData.secondaryMuscles] - Secondary muscles worked
 * @param {string} exerciseData.category - Exercise category (compound/isolation)
 * @param {string} exerciseData.movementPattern - Movement pattern
 * @returns {Promise<Object>} Created exercise document
 * @throws {Error} On validation failure or duplicate name
 */
const createExercise = async (exerciseData) => {
  try {
    const exercise = new Exercise(exerciseData);
    await exercise.save();
    return exercise;
  } catch (error) {
    if (error.code === 11000) {
      const customError = new Error("Exercise with this name already exists");
      customError.type = "DUPLICATE_ERROR";
      throw customError;
    }
    throw error;
  }
};

/**
 * Update an existing exercise
 * @param {string} id - Exercise ID
 * @param {Object} updatedFields - Fields to update
 * @param {string} [updatedFields.name] - Updated exercise name
 * @param {string} [updatedFields.equipment] - Updated equipment type
 * @param {string} [updatedFields.primaryMuscle] - Updated primary muscle
 * @param {string[]} [updatedFields.secondaryMuscles] - Updated secondary muscles
 * @param {string} [updatedFields.category] - Updated category
 * @param {string} [updatedFields.movementPattern] - Updated movement pattern
 * @returns {Promise<Object>} Updated exercise document
 * @throws {Error} When exercise not found or validation fails
 */
const updateExercise = async (id, updatedFields) => {
  try {
    return await Exercise.findByIdAndUpdate(
      id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Soft delete an exercise
 * @param {string} id - Exercise ID
 * @returns {Promise<Object>} Deleted exercise document
 * @throws {Error} When exercise not found
 */
const deleteExercise = async (id) => {
  try {
    return await Exercise.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    );
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
};
