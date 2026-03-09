import {
  type PaginateModel,
  type Document,
  model,
  Schema,
  Types,
} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

import {
  DIFFICULTIES,
  GOALS,
  SPLIT_TYPES,
  type Goal,
  type Difficulty,
  type SplitType,
} from "../types/enums.types.js";

export interface ITemplate {
  createdAt?: Date;
  createdBy: Types.ObjectId;
  daysPerWeek: number;
  description?: string;
  difficulty: Difficulty;
  goals: Goal[];
  name: string;
  splitType: SplitType;
  updatedAt?: Date;
  workouts: {
    dayNumber: number;
    exercises: {
      exerciseId: Types.ObjectId;
      notes?: string;
      order: number;
      targetReps: number;
      targetRir: number;
      targetSets: number;
    }[];
    name: string;
  }[];
}

const templateSchema = new Schema<TemplateDocument>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    daysPerWeek: {
      max: [14, "Session number per week cannot exceed 14"],
      min: [1, "Must have at least 1 day per week"],
      required: true,
      type: Number,
    },

    description: {
      maxlength: [500, "Description cannot exceed 500 characters"],
      type: String,
    },

    difficulty: {
      enum: DIFFICULTIES,
      required: true,
      type: String,
    },

    goals: {
      default: [],
      type: [
        {
          enum: GOALS,
          type: String,
        },
      ],
    },

    name: {
      maxlength: [50, "Name cannot exceed 50 characters"],
      required: true,
      trim: true,
      type: String,
      unique: true,
    },

    splitType: {
      default: "other",
      enum: SPLIT_TYPES,
      required: true,
      type: String,
    },

    workouts: {
      type: [
        {
          dayNumber: {
            min: [1, "Workout day must be at least 1"],
            type: Number,
          },

          exercises: {
            type: [
              {
                exerciseId: {
                  ref: "Exercise",
                  required: true,
                  type: Schema.Types.ObjectId,
                },
                notes: {
                  maxlength: [999, "Notes cannot exceed 999 characters"],
                  type: String,
                },
                order: {
                  min: [1, "Order must start at 1"],
                  required: true,
                  type: Number,
                },
                targetReps: {
                  max: [100, "Reps cannot exceed 100"],
                  min: [1, "Reps must be at least 1"],
                  required: true,
                  type: Number,
                },
                targetRir: {
                  max: [10, "Rir cannot be above 10"],
                  min: [0, "Rir cannot be negative"],
                  required: true,
                  type: Number,
                },
                targetSets: {
                  max: [20, "Sets cannot exceed 20"],
                  min: [1, "Sets must be at least 1"],
                  required: true,
                  type: Number,
                },
              },
            ],
            validate: {
              message: "Workout must have at least 1 exercise",
              validator: (arr: unknown[]) => arr.length > 0,
            },
          },

          name: {
            maxlength: [50, "Name cannot exceed 50 characters"],
            required: true,
            trim: true,
            type: String,
          },
        },
      ],
      validate: {
        message: "Split must have at least 1 workout",
        validator: (arr: unknown[]) => arr.length > 0,
      },
    },
  },
  {
    timestamps: true,
  },
);

templateSchema.index({ splitType: 1 });
templateSchema.index({ difficulty: 1 });
templateSchema.index({ goals: 1 });
templateSchema.index({ createdAt: -1 });
templateSchema.index({ name: "text" });

templateSchema.plugin(mongoosePaginate);

export interface TemplateDocument extends ITemplate, Document {}

export const TemplateModel = model<
  TemplateDocument,
  PaginateModel<TemplateDocument>
>("Template", templateSchema, "Templates");
