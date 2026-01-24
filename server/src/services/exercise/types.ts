import type {
  Equipment,
  ExerciseCategory,
  MovementPattern,
  MuscleGroup,
} from '../../types/enums.types.js';

export type ExerciseFilters = {
  primaryMuscle?: MuscleGroup;
  equipment?: Equipment;
  category?: ExerciseCategory;
  movementPattern?: MovementPattern;
};
