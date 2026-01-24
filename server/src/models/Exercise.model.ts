import mongoose, { Schema } from 'mongoose';
import type { PaginateModel, InferSchemaType } from 'mongoose';
import {
  MUSCLE_GROUPS,
  MOVEMENT_PATTERNS,
  EQUIPMENT,
  EXERCISE_CATEGORIES,
  PROGRESSION_TYPES,
} from '../../types/enums.types.js';
import mongoosePaginate from 'mongoose-paginate-v2';

const exerciseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    equipment: {
      type: String,
      enum: EQUIPMENT,
      lowercase: true,
      default: 'none',
    },

    primaryMuscle: {
      type: String,
      enum: MUSCLE_GROUPS,
      required: true,
      lowercase: true,
    },

    secondaryMuscles: {
      type: [String],
      enum: MUSCLE_GROUPS,
      lowercase: true,
      default: [],
      validate: {
        validator: (arr: string[]) => arr.length <= 3,
        message: 'Maximum of 3 secondary muscle groups',
      },
    },

    category: {
      type: String,
      enum: EXERCISE_CATEGORIES,
      required: true,
      lowercase: true,
    },

    movementPattern: {
      type: String,
      enum: MOVEMENT_PATTERNS,
      required: true,
      lowercase: true,
    },

    typicalRepRange: {
      min: { type: Number, default: 5 },
      max: { type: Number, default: 30 },
    },

    rirBoundaries: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 5 },
    },

    progressionType: {
      type: String,
      enum: PROGRESSION_TYPES,
      default: 'weight',
      lowercase: true,
    },

    instructions: {
      type: String,
      maxlength: [500, 'Instructions cannot exceed 500 characters'],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

exerciseSchema.index({ primaryMuscle: 1 });
exerciseSchema.index({ equipment: 1 });
exerciseSchema.index({ name: 'text' });

exerciseSchema.plugin(mongoosePaginate);

export type Exercise = InferSchemaType<typeof exerciseSchema>;

export const ExerciseModel = mongoose.model<Exercise, PaginateModel<Exercise>>(
  'Exercise',
  exerciseSchema,
);
