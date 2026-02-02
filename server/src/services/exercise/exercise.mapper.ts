import type { IExercise } from '../../interfaces';
import type { PaginateResult } from 'mongoose';
import type { ExerciseDTO } from './exercise.dto.js';

export function toExerciseDTO(exercise: IExercise): ExerciseDTO {
  const rawId = (exercise as { _id?: { toString(): string } })._id;
  return {
    id: rawId ? rawId.toString() : '',
    name: exercise.name,
    equipment: exercise.equipment,
    primaryMuscle: exercise.primaryMuscle,
    secondaryMuscles: exercise.secondaryMuscles ?? [],
    category: exercise.category,
    movementPattern: exercise.movementPattern,
    instructions: exercise.instructions ?? undefined,
  };
}

export function mapPaginatedExercises(
  result: PaginateResult<IExercise>,
): PaginateResult<ExerciseDTO> {
  return {
    ...result,
    docs: result.docs.map(toExerciseDTO),
  };
}