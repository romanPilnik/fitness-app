import type { PaginatedResponse, PaginationQuery } from '../../types/api.types.js';
import type { ExerciseFilters } from './types.js';
import type { Exercise } from '../../models/Exercise/Exercise.types.js';

async function getExercises(
  filters: ExerciseFilters = {},
  options: PaginationQuery & ExerciseFilters = {},
): Promise<PaginatedResponse<Exercise>> {
  const queryFilters = {
    isActive: true,
    ...filters,
  };

  const textFilter = options && options.q ? { $text: { $search: options.q } } : {};
  const query = { ...queryFilters, ...textFilter };

  const paginateOptions = {
    page: options.page || 1,
    limit: options.limit || 20,
    select: '-__v',
    lean: true,
  };

  return await Exercise.paginate(query, paginateOptions);
}

const getExerciseById = async (id) => {
  const exercise = await Exercise.findById(id);
  if (!exercise) {
    const error = new Error('Exercise not found');
    error.statusCode = 404;
    throw error;
  }
  return exercise;
};

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
