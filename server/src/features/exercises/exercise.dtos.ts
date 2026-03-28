import {
  MuscleGroup,
  Equipment,
  ExerciseCategory,
  MovementPattern,
} from "@/generated/prisma/enums";
import type { CursorPaginationParams } from "@/lib/pagination";

export interface GetExercisesDTO extends CursorPaginationParams {
  primaryMuscle?: MuscleGroup;
  equipment?: Equipment;
  category?: ExerciseCategory;
  movementPattern?: MovementPattern;
  userId?: string;
}

export interface GetExerciseByIdDTO {
  id: string;
}

export interface CreateExerciseDTO {
  createdByUserId?: string | null;
  name: string;
  equipment: Equipment;
  primaryMuscle: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  category: ExerciseCategory;
  movementPattern: MovementPattern;
  instructions?: string;
}

export interface UpdateExerciseDTO {
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

export interface DeleteExerciseDTO {
  id: string;
  userId: string;
}
