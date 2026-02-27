import type {
  Equipment,
  ExerciseCategory,
  MovementPattern,
  MuscleGroup,
} from "../../types/enums.types.js";
import { type PaginationQuery } from "../../types/api.types.js";

export interface GetExercisesInputDTO {
  filters?: {
    primaryMuscle?: MuscleGroup;
    equipment?: Equipment;
    category?: ExerciseCategory;
    movementPattern?: MovementPattern;
  };
  pagination?: PaginationQuery;
}

export interface GetExerciseByIdInputDTO {
  exerciseId: string;
}

export interface CreateExerciseInputDTO {
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
}

export interface UpdateExerciseInputDTO {
  exerciseId: string;
  updates: Partial<CreateExerciseInputDTO>;
}

export interface DeleteExerciseInputDTO {
  exerciseId: string;
}

export interface ExerciseDTO {
  id: string;
  name: string;
  equipment: Equipment;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  category: ExerciseCategory;
  movementPattern: MovementPattern;
  instructions?: string;
}
