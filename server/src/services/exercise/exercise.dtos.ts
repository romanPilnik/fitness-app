import {
  MuscleGroup,
  Equipment,
  ExerciseCategory,
  MovementPattern,
} from "../../generated/prisma/enums";
import type { CursorPaginationParams } from "../../lib/pagination";

export interface getExercisesDTO extends CursorPaginationParams {
  primaryMuscle?: MuscleGroup;
  equipment?: Equipment;
  category?: ExerciseCategory;
  movementPattern?: MovementPattern;
  userId?: string;
}

export interface getExerciseByIdDTO {
  id: string;
}

export interface createExerciseDTO {
  createdByUserId?: string | null;
  name: string;
  equipment: Equipment;
  primaryMuscle: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  category: ExerciseCategory;
  movementPattern: MovementPattern;
  instructions?: string;
}

export interface updateExerciseDTO {
  id: string;
  userId: string;
  name?: string;
  equipment?: Equipment;
  primaryMuscle?: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  category?: ExerciseCategory;
  movementPattern?: MovementPattern;
  instructions?: string;
}

export interface deleteExerciseDTO {
  id: string;
  userId: string;
}
