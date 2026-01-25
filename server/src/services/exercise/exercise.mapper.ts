import type { Exercise } from '../../models/Exercise.model.js';
import type { PaginateResult } from 'mongoose';
import type { ExerciseDTO } from './exercise.dto.js';

export function toExerciseDTO(exercise: Exercise): ExerciseDTO {
  const rawId = (exercise as { _id?: { toString(): string } })._id;
  return {
    id: rawId ? rawId.toString() : '',
    name: exercise.name,
    equipment: exercise.equipment,
    primaryMuscle: exercise.primaryMuscle,
    secondaryMuscles: exercise.secondaryMuscles ?? [],
    category: exercise.category,
    movementPattern: exercise.movementPattern,
    typicalRepRange: {
      min: exercise.typicalRepRange?.min ?? 5,
      max: exercise.typicalRepRange?.max ?? 30,
    },
    rirBoundaries: {
      min: exercise.rirBoundaries?.min ?? 0,
      max: exercise.rirBoundaries?.max ?? 5,
    },
    progressionType: exercise.progressionType,
    instructions: exercise.instructions ?? undefined,
  };
}

export function mapPaginatedExercises(
  result: PaginateResult<Exercise>,
): PaginateResult<ExerciseDTO> {
  return {
    ...result,
    docs: result.docs.map(toExerciseDTO),
  };
}