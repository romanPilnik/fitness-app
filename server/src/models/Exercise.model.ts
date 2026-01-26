import { Schema, model, HydratedDocument, PaginateModel } from 'mongoose';
import {
  MUSCLE_GROUPS,
  MOVEMENT_PATTERNS,
  EQUIPMENT,
  EXERCISE_CATEGORIES,
} from '../types/enums.types.js';
import { IExercise } from '../interfaces';
import mongoosePaginate from 'mongoose-paginate-v2';

const exerciseSchema = new Schema<IExercise>(
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

export type ExerciseDocument = HydratedDocument<IExercise>;

interface ExerciseModelType extends PaginateModel<ExerciseDocument> {}

export const ExerciseModel = model<IExercise,ExerciseModelType>('Exercise', exerciseSchema);

