const Exercise = require("../../models/Exercise");
const { parsePaginationParams, calculatePagination } = require("../../utils/pagination");

/**
 * Exercise Service
 * Handles all business logic for exercise operations
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
