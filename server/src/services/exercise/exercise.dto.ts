import type {
  Equipment,
  ExerciseCategory,
  MovementPattern,
  MuscleGroup,
  ProgressionType,
} from '../../types/enums.types.js';
import { PaginationQuery } from '../../types/api.types.js';

export type GetExercisesInputDTO = {
  filters?: {
    primaryMuscle?: MuscleGroup;
    equipment?: Equipment;
    category?: ExerciseCategory;
    movementPattern?: MovementPattern;
  };
  pagination?: PaginationQuery;
};

export type GetExerciseByIdInputDTO = {
  exerciseId: string;
};

export type CreateExerciseInputDTO = {
  name: string;
  equipment: Equipment;
  primaryMuscle: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  category: ExerciseCategory;
  movementPattern: MovementPattern;
  typicalRepRange?: {
    min?: number;
    max?: number;
  };
  rirBoundaries?: {
    min?: number;
    max?: number;
  };
  instructions?: string;
};

export type UpdateExerciseInputDTO = {
  exerciseId: string;
  updates: Partial<CreateExerciseInputDTO>;
};

export type DeleteExerciseInputDTO = {
  exerciseId: string;
};

export type ExerciseDTO = {
  id: string;
  name: string;
  equipment: Equipment;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  category: ExerciseCategory;
  movementPattern: MovementPattern;
  instructions?: string;
};