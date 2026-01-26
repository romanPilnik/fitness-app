import { Types } from "mongoose";
import { Equipment, ExerciseCategory, MovementPattern, MuscleGroup } from "../types/enums.types";

export interface IExercise {
  _id?: string | Types.ObjectId;
  name: string;
  equipment: Equipment;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  category: ExerciseCategory;
  movementPattern: MovementPattern;
  instructions?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
