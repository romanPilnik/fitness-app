import {
  Types,
  Schema,
  model,
  type PaginateModel,
  type Document,
} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import {
  SPLIT_TYPES,
  DIFFICULTIES,
  GOALS,
  PROGRAM_STATUSES,
  PROGRAM_SOURCES,
} from "../types/enums.types.js";
import type {
  ProgramSource,
  Difficulty,
  Goal,
  SplitType,
  ProgramStatus,
} from "../types/enums.types.js";

export interface IProgram {
  userId: string | Types.ObjectId;
  sourceTemplateId?: string | Types.ObjectId;
  sourceTemplateName?: string;
  createdFrom: ProgramSource;
  name: string;
  description?: string;
  difficulty: Difficulty;
  goals: Goal[];
  splitType: SplitType;
  daysPerWeek: number;
  workouts: {
    name: string;
    dayNumber: number;
    exercises: {
      exerciseId: string | Types.ObjectId;
      order: number;
      targetSets: number;
      targetReps: number;
      targetRir: number;
      notes?: string;
    }[];
  }[];
  status: ProgramStatus;
  startDate: Date;
  currentWeek: number;
  nextWorkoutIndex: number;
  lastCompletedWorkoutDate?: Date;
  hasBeenModified: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const programSchema = new Schema<ProgramDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sourceTemplateId: {
      type: Schema.Types.ObjectId,
      ref: "Template",
      default: null,
    },
    sourceTemplateName: String,
    createdFrom: {
      type: String,
      enum: PROGRAM_SOURCES,
      default: "scratch",
      lowercase: true,
      required: true,
    },

    name: {
      type: String,
      maxlength: [50, "Name cannot exceed 50 characters"],
      required: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    difficulty: {
      type: String,
      enum: DIFFICULTIES,
      required: true,
      lowercase: true,
    },
    goals: {
      type: [
        {
          type: String,
          enum: GOALS,
          required: true,
          lowercase: true,
          default: "hypertrophy",
        },
      ],
      validate: {
        validator: (arr: string[]) => arr.length >= 1 && arr.length <= 3,
        message: "Maximum of 3 goals",
      },
    },

    splitType: {
      type: String,
      enum: SPLIT_TYPES,
      default: "other",
      required: true,
      lowercase: true,
    },
    daysPerWeek: {
      type: Number,
      min: [1, "Must have at least 1 day per week"],
      max: [14, "Session number per week cannot exceed 14"],
      required: true,
    },

    workouts: {
      type: [
        {
          name: {
            type: String,
            maxlength: [50, "Name cannot exceed 50 characters"],
            required: true,
            trim: true,
          },
          dayNumber: {
            type: Number,
            min: [1, "Workout day must be at least 1"],
          },

          exercises: {
            type: [
              {
                exerciseId: {
                  type: Schema.Types.ObjectId,
                  ref: "Exercise",
                  required: true,
                },
                order: {
                  type: Number,
                  required: true,
                  min: [1, "Order must start at 1"],
                },
                targetSets: {
                  type: Number,
                  min: [1, "Sets must be at least 1"],
                  max: [20, "Sets cannot exceed 20"],
                  required: true,
                },
                targetReps: {
                  type: Number,
                  min: [1, "Reps must be at least 1"],
                  max: [100, "Reps cannot exceed 100"],
                  required: true,
                },
                targetRir: {
                  type: Number,
                  min: [0, "Rir cannot be negative"],
                  max: [10, "Rir cannot be above 10"],
                  required: true,
                },
                notes: {
                  type: String,
                  maxlength: [999, "Notes cannot exceed 999 characters"],
                },
              },
            ],
            validate: {
              validator: function (arr: unknown[]) {
                return arr.length > 0;
              },
              message: "Workout must have at least 1 exercise",
            },
          },
        },
      ],
      validate: {
        validator: function (arr: unknown[]) {
          return arr.length > 0;
        },
        message: "Split must have at least 1 workout",
      },
    },

    status: {
      type: String,
      enum: PROGRAM_STATUSES,
      default: "active",
      required: true,
      lowercase: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    currentWeek: {
      type: Number,
      default: 1,
    },
    nextWorkoutIndex: {
      type: Number,
      default: 0,
    },
    lastCompletedWorkoutDate: Date,

    hasBeenModified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

programSchema.index({ userId: 1, status: 1 });

programSchema.plugin(mongoosePaginate);

export interface ProgramDocument extends IProgram, Document {}

export const ProgramModel = model<
  ProgramDocument,
  PaginateModel<ProgramDocument>
>("Program", programSchema, "Program");
