import mongoose, { Schema, Types } from 'mongoose';
import type { InferSchemaType, PaginateModel, Model, HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import {
  SPLIT_TYPES,
  DIFFICULTIES,
  GOALS,
  PERIODIZATION_TYPES,
  VOLUME_PROGRESSIONS,
  PROGRAM_STATUSES,
  PROGRAM_SOURCES,
} from '../../types/enums.types.js';

interface IProgramMethods {
  isDeloadWeek(): boolean;
  getCurrentWeekRIR(): number | null;
  getNextWorkout(): Program['workouts'][number] | null;
}

interface IProgramModel extends Model<Program, object, IProgramMethods> {
  findActiveProgram(
    _userId: Types.ObjectId | string,
  ): Promise<HydratedDocument<Program, IProgramMethods> | null>;
}

const programSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sourceTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProgramTemplate',
      default: null,
    },
    sourceTemplateName: String,
    createdFrom: {
      type: String,
      enum: PROGRAM_SOURCES,
      default: 'scratch',
      lowercase: true,
      required: true,
    },

    name: {
      type: String,
      maxlength: [50, 'Name cannot exceed 50 characters'],
      required: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
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
          default: 'hypertrophy',
        },
      ],
      validate: {
        validator: (arr: string[]) => arr.length <= 3,
        message: 'Maximum of 3 goals',
      },
    },

    splitType: {
      type: String,
      enum: SPLIT_TYPES,
      default: 'other',
      required: true,
      lowercase: true,
    },
    daysPerWeek: {
      type: Number,
      min: [1, 'Must have at least 1 day per week'],
      max: [14, 'Session number per week cannot exceed 14'],
      required: true,
    },

    workouts: {
      type: [
        {
          name: {
            type: String,
            maxlength: [50, 'Name cannot exceed 50 characters'],
            required: true,
            trim: true,
          },
          dayNumber: {
            type: Number,
            min: [1, 'Workout day must be at least 1'],
          },

          exercises: {
            type: [
              {
                exerciseId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: 'Exercise',
                  required: true,
                },
                order: {
                  type: Number,
                  required: true,
                  min: [1, 'Order must start at 1'],
                },
                targetSets: {
                  type: Number,
                  min: [1, 'Sets must be at least 1'],
                  max: [20, 'Sets cannot exceed 20'],
                  required: true,
                },
                targetReps: {
                  type: Number,
                  min: [1, 'Reps must be at least 1'],
                  max: [100, 'Reps cannot exceed 100'],
                  required: true,
                },
                targetRir: {
                  type: Number,
                  min: [0, 'Rir cannot be negative'],
                  max: [10, 'Rir cannot be above 10'],
                  required: true,
                },
                notes: {
                  type: String,
                  maxlength: [999, 'Notes cannot exceed 999 characters'],
                },
              },
            ],
            validate: {
              validator: function (arr: unknown[]) {
                return arr.length > 0;
              },
              message: 'Workout must have at least 1 exercise',
            },
          },
        },
      ],
      validate: {
        validator: function (arr: unknown[]) {
          return arr.length > 0;
        },
        message: 'Split must have at least 1 workout',
      },
    },

    periodization: {
      type: {
        type: String,
        enum: PERIODIZATION_TYPES,
        required: true,
        default: 'linear_rir',
        lowercase: true,
      },

      config: {
        weeks: {
          type: Number,
          min: [1, 'Mesocycle must be at least 1 week'],
          max: [12, 'Mesocycle cannot exceed 12 weeks'],
          required: true,
        },

        rirProgression: {
          type: [Number],
          validate: {
            validator: function (
              this: { periodization?: { config?: { weeks?: number } } },
              arr: number[],
            ) {
              if (
                this.periodization?.config?.weeks &&
                arr.length !== this.periodization?.config?.weeks
              ) {
                return false;
              }
              return arr.every((rir) => rir >= 0 && rir <= 10);
            },
            message: 'RIR progression must match week count and be between 0-10',
          },
        },

        deloadWeek: {
          type: Number,
          min: [4, 'Deload weeks must be between 4-20'],
          max: [20, 'Deload weeks must be between 4-20'],
          validate: {
            validator: function (
              this: { periodization?: { config?: { weeks?: number } } },
              value: number,
            ) {
              if (
                this.periodization?.config?.weeks != null &&
                value > this.periodization.config.weeks
              ) {
                return false;
              }
              return true;
            },
            message: 'Deload week must be within mesocycle duration',
          },
        },

        autoDeload: {
          enabled: { type: Boolean, default: true },

          triggerAfterFailures: {
            type: Number,
            default: 2,
            min: [1, 'Must fail at least 1 session to trigger'],
            max: [5, 'Trigger threshold too high'],
          },

          fatigueThreshold: {
            type: Number,
            default: 8,
            min: [1, 'Fatigue threshold minimum is 1'],
            max: [10, 'Fatigue threshold maximum is 10'],
          },
        },

        volumeProgression: {
          type: String,
          enum: VOLUME_PROGRESSIONS,
          default: 'static',
          required: true,
          lowercase: true,
        },
      },
    },

    status: {
      type: String,
      enum: PROGRAM_STATUSES,
      default: 'active',
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
    lastModified: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

programSchema.index({ userId: 1, status: 1 });

programSchema.methods.isDeloadWeek = function (): boolean {
  return this.currentWeek === this.periodization.config.deloadWeek;
};

programSchema.methods.getCurrentWeekRIR = function (): number | null {
  const index = this.currentWeek - 1;
  const rirArray = this.periodization.config.rirProgression;

  if (index < 0 || index >= rirArray.length) {
    return null;
  }

  return rirArray[index];
};

programSchema.methods.getNextWorkout = function (): Program['workouts'][number] | null {
  if (!this.workouts || this.workouts.length === 0) {
    return null;
  }
  if (this.nextWorkoutIndex >= this.workouts.length) {
    return this.workouts[0];
  }
  return this.workouts[this.nextWorkoutIndex];
};

programSchema.statics.findActiveProgram = async function (
  userId: Types.ObjectId | string,
): Promise<HydratedDocument<Program, IProgramMethods> | null> {
  if (!userId) {
    throw new Error('userId is required');
  }

  return await this.findOne({
    userId,
    status: 'active',
  });
};

programSchema.virtual('progressPercentage').get(function () {
  if (this.periodization?.config?.weeks != null && this.currentWeek != null) {
    return (this.currentWeek / this.periodization.config.weeks) * 100;
  }
  return 0;
});

programSchema.virtual('weeksRemaining').get(function () {
  if (this.periodization?.config?.weeks) return this.periodization.config.weeks - this.currentWeek;
  return -1;
});

programSchema.virtual('isComplete').get(function () {
  if (this.periodization?.config?.weeks) return this.currentWeek > this.periodization.config.weeks;
  return false;
});

programSchema.plugin(mongoosePaginate);

export type Program = InferSchemaType<typeof programSchema>;

export const ProgramModel = mongoose.model<Program, IProgramModel & PaginateModel<Program>>(
  'Program',
  programSchema,
);
