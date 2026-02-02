import { Schema, model, HydratedDocument, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import {
  SPLIT_TYPES,
  DIFFICULTIES,
  GOALS,
} from '../types/enums.types.js';
import { ITemplate } from '../interfaces';

interface ITemplateMethods {}

interface TemplateModelType extends PaginateModel<TemplateDocument> {}

export type TemplateDocument = HydratedDocument<ITemplate, ITemplateMethods>;

const templateSchema = new Schema<ITemplate, TemplateModelType, ITemplateMethods>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    createdBy: {
      type: String,
      minlength: [2, 'Owner name must be at least 2 characters'],
      maxlength: [50, 'Owner name cannot exceed 50 characters'],
      trim: true,
      required: true,
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

    /* periodization: {
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
                arr.length !== this.periodization.config.weeks
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
              if (this.periodization?.config?.weeks && value > this.periodization.config.weeks) {
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
    }, */

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
                  type: Schema.Types.ObjectId,
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
              validator: (arr: unknown[]) => arr.length > 0,
              message: 'Workout must have at least 1 exercise',
            },
          },
        },
      ],
      validate: {
        validator: (arr: unknown[]) => arr.length > 0,
        message: 'Split must have at least 1 workout',
      },
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

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

templateSchema.plugin(mongoosePaginate as any);

export const TemplateModel = model<ITemplate, TemplateModelType>(
  'Template',
  templateSchema,
);
