const Exercise = require('../../models/Exercise');
const {
  parsePaginationParams,
  calculatePagination,
} = require('../../utils/pagination');

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
  const queryFilters = {
    isActive: true,
    ...filters,
  };

  const { page, limit, skip } = parsePaginationParams(options || {});
  const textFilter =
    options && options.q ? { $text: { $search: options.q } } : {};
  const query = { ...queryFilters, ...textFilter };

  const exercises = await Exercise.find(query)
    .select('-__v')
    .skip(skip)
    .limit(limit)
    .lean();

  const count = await Exercise.countDocuments(query);

  return {
    exercises,
    count,
    pagination: calculatePagination(page, limit, count),
  };
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
    if (error.name === 'CastError') {
      const customError = new Error('Invalid exercise ID format');
      customError.type = 'VALIDATION_ERROR';
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
      const customError = new Error('Exercise with this name already exists');
      customError.type = 'DUPLICATE_ERROR';
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
  return await Exercise.findByIdAndUpdate(
    id,
    { $set: updatedFields },
    { new: true, runValidators: true }
  );
};

/**
 * Soft delete an exercise
 * @param {string} id - Exercise ID
 * @returns {Promise<Object>} Deleted exercise document
 * @throws {Error} When exercise not found
 */
const deleteExercise = async (id) => {
  return await Exercise.findByIdAndUpdate(
    id,
    { $set: { isActive: false } },
    { new: true }
  );
};

module.exports = {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
};
