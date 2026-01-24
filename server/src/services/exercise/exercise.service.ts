import type { PaginationQuery } from '../../types/api.types.js';
import type { ExerciseFilters } from './types.js';
import { ExerciseModel } from '../../models/Exercise.model.js';
import { PaginateResult } from 'mongoose';
import { AppError } from '../../errors/AppError.js';
import { ERROR_CODES } from '../../types/error.types.js';
import type { CreateExerciseInputDTO, UpdateExerciseInputDTO, ExerciseDTO } from './mappers.js';
import { mapPaginatedExercises, toExerciseDTO } from './mappers.js';

async function getExercises(
  filters: ExerciseFilters = {},
  options: PaginationQuery & ExerciseFilters = {},
): Promise<PaginateResult<ExerciseDTO>> {
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

  const result = await ExerciseModel.paginate(query, paginateOptions);
  return mapPaginatedExercises(result);
}

async function getExerciseById(id: string): Promise<ExerciseDTO> {
  const exercise = await ExerciseModel.findById(id);
  if (!exercise) {
    throw new AppError('Exercise not found', 404, ERROR_CODES.NOT_FOUND);
  }
  return toExerciseDTO(exercise);
}

async function createExercise(exerciseData: CreateExerciseInputDTO): Promise<ExerciseDTO> {
  const existing = await ExerciseModel.findOne({
    name: exerciseData.name,
    isActive: true,
  });
  if (existing) {
    throw new AppError('Exercise with this name already exists', 400, ERROR_CODES.DUPLICATE_VALUE);
  }
  const exercise = new ExerciseModel(exerciseData);
  await exercise.validate();
  await exercise.save();
  return toExerciseDTO(exercise);
}

async function updateExercise(id: string, updatedFields: UpdateExerciseInputDTO) {
  const updatedExercise = await ExerciseModel.findByIdAndUpdate(
    id,
    { $set: updatedFields },
    { new: true, runValidators: true },
  );
  if (!updatedExercise) {
    throw new AppError('Exercise not found', 404, ERROR_CODES.NOT_FOUND);
  }
  return toExerciseDTO(updatedExercise);
}

async function deleteExercise(id: string): Promise<void> {
  const deletedExercise = await ExerciseModel.findByIdAndUpdate(
    id,
    { $set: { isActive: false } },
    { new: true },
  );
  if (!deletedExercise) {
    throw new AppError('Exercise not found', 404, ERROR_CODES.NOT_FOUND);
  }
}

export const ExerciseService = {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
};
