import { ExerciseModel } from '../../models/Exercise.model.js';
import type { PaginateResult } from 'mongoose';
import { AppError } from '../../errors/AppError.js';
import { ERROR_CODES } from '../../types/error.types.js';
import type {
  GetExercisesInputDTO,
  GetExerciseByIdInputDTO,
  CreateExerciseInputDTO,
  UpdateExerciseInputDTO,
  DeleteExerciseInputDTO,
  ExerciseDTO,
} from './exercise.dto.js';
import { mapPaginatedExercises, toExerciseDTO } from './exercise.mapper.js';

async function getExercises(input: GetExercisesInputDTO = {}): Promise<PaginateResult<ExerciseDTO>> {
  const { filters = {}, pagination = {} } = input;

  const query = {
    isActive: true,
    ...filters,
  };

  const textFilter = pagination.q ? { $text: { $search: pagination.q } } : {};
  const queryOptions = { ...query, ...textFilter };

  const paginationOptions = {
    page: pagination.page || 1,
    limit: pagination.limit || 20,
    select: '-__v',
    lean: true,
  };

  const result = await ExerciseModel.paginate(queryOptions, paginationOptions);
  return mapPaginatedExercises(result);
}

async function getExerciseById(input: GetExerciseByIdInputDTO): Promise<ExerciseDTO> {
  const { exerciseId } = input;

  const exercise = await ExerciseModel.findById(exerciseId);
  if (!exercise) {
    throw new AppError('Exercise not found', 404, ERROR_CODES.NOT_FOUND);
  }
  return toExerciseDTO(exercise);
}

async function createExercise(input: CreateExerciseInputDTO): Promise<ExerciseDTO> {
  const existing = await ExerciseModel.findOne({
    name: input.name,
    isActive: true,
  });
  if (existing) {
    throw new AppError('Exercise with this name already exists', 400, ERROR_CODES.DUPLICATE_VALUE);
  }

  const exercise = new ExerciseModel(input);
  await exercise.validate();
  await exercise.save();
  return toExerciseDTO(exercise);
}

async function updateExercise(input: UpdateExerciseInputDTO): Promise<ExerciseDTO> {
  const { exerciseId, updates } = input;

  const updatedExercise = await ExerciseModel.findByIdAndUpdate(
    exerciseId,
    { $set: updates },
    { new: true, runValidators: true },
  );
  if (!updatedExercise) {
    throw new AppError('Exercise not found', 404, ERROR_CODES.NOT_FOUND);
  }
  return toExerciseDTO(updatedExercise);
}

async function deleteExercise(input: DeleteExerciseInputDTO): Promise<void> {
  const { exerciseId } = input;

  const deletedExercise = await ExerciseModel.findByIdAndUpdate(
    exerciseId,
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
