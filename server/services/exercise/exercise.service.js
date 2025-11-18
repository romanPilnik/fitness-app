const Exercise = require('../../models/Exercise');
const { parsePaginationParams, calculatePagination } = require('../../utils/pagination');

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
  const textFilter = options && options.q ? { $text: { $search: options.q } } : {};
  const query = { ...queryFilters, ...textFilter };

  const exercises = await Exercise.find(query).select('-__v').skip(skip).limit(limit).lean();

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
  const exercise = await Exercise.findById(id);
  if (!exercise) {
    const error = new Error('Exercise not found');
    error.statusCode = 404;
    throw error;
  }
  return exercise;
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
  const existing = await Exercise.findOne({
    name: exerciseData.name,
    isActive: true,
  });
  if (existing) {
    const error = new Error('Exercise with this name already exists');
    error.statusCode = 409;
    throw error;
  }
  const exercise = new Exercise(exerciseData);
  await exercise.validate();
  await exercise.save();
  return exercise;
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
  const updatedExercise = await Exercise.findByIdAndUpdate(
    id,
    { $set: updatedFields },
    { new: true, runValidators: true },
  );
  if (!updatedExercise) {
    const error = new Error('Exercise not found');
    error.statusCode = 404;
    throw error;
  }
  return updatedExercise;
};

/**
 * Soft delete an exercise
 * @param {string} id - Exercise ID
 * @returns {Promise<void>}
 * @throws {Error} When exercise not found
 */
const deleteExercise = async (id) => {
  const deletedExercise = await Exercise.findByIdAndUpdate(
    id,
    { $set: { isActive: false } },
    { new: true },
  );
  if (!deletedExercise) {
    const error = new Error('Exercise not found');
    error.statusCode = 404;
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
