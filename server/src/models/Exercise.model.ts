import type { Document, PaginateModel } from "mongoose";

import { model, Schema } from "mongoose";
import paginate from "mongoose-paginate-v2";

import {
  EQUIPMENT,
  type Equipment,
  EXERCISE_CATEGORIES,
  type ExerciseCategory,
  MOVEMENT_PATTERNS,
  type MovementPattern,
  MUSCLE_GROUPS,
  type MuscleGroup,
} from "../types/enums.types";

export interface IExercise {
  category: ExerciseCategory;
  equipment: Equipment;
  instructions?: string;
  isActive: boolean;
  movementPattern: MovementPattern;
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  createdAt?: Date;
  updatedAt?: Date;
}

const exerciseSchema = new Schema<ExerciseDocument>(
  {
    category: {
      enum: EXERCISE_CATEGORIES,
      required: true,
      type: String,
    },

    equipment: {
      default: "none",
      enum: EQUIPMENT,
      type: String,
    },

    instructions: {
      maxlength: [500, "Instructions cannot exceed 500 characters"],
      type: String,
    },

    isActive: {
      default: true,
      type: Boolean,
    },

    movementPattern: {
      enum: MOVEMENT_PATTERNS,
      required: true,
      type: String,
    },

    name: {
      maxlength: [50, "Name cannot exceed 50 characters"],
      required: true,
      trim: true,
      type: String,
      unique: true,
    },

    primaryMuscle: {
      enum: MUSCLE_GROUPS,
      required: true,
      type: String,
    },

    secondaryMuscles: {
      default: [],
      enum: MUSCLE_GROUPS,
      type: [String],
      validate: {
        message: "Maximum of 3 secondary muscle groups",
        validator: (arr: string[]) => arr.length <= 3,
      },
    },
  },
  {
    timestamps: true,
  },
);

exerciseSchema.index({ primaryMuscle: 1 });
exerciseSchema.index({ equipment: 1 });
exerciseSchema.index({ name: "text" });

exerciseSchema.plugin(paginate);

export interface ExerciseDocument extends IExercise, Document {}

export const ExerciseModel = model<
  ExerciseDocument,
  PaginateModel<ExerciseDocument>
>("Exercise", exerciseSchema, "Exercise");
