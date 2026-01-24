import mongoose, { Schema, Types } from 'mongoose';
import type { PaginateModel, InferSchemaType, Model, HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { SESSION_COMPLETION_STATUSES, SET_TYPES } from '../types/enums.types.js';

interface ISessionMethods {
  calculateTotalVolume(): number;
}

interface ISessionModel extends Model<Session, object, ISessionMethods> {
  getRecentSessions(
    _userId: Types.ObjectId | string,
    _limit?: number,
  ): Promise<HydratedDocument<Session, ISessionMethods>[]>;
  getExerciseHistory(
    _userId: Types.ObjectId | string,
    _exerciseId: Types.ObjectId | string,
    _limit?: number,
  ): Promise<HydratedDocument<Session, ISessionMethods>[]>;
}

const sessionSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program',
      required: true,
    },

    workoutName: {
      type: String,
      maxlength: [50, 'Name cannot exceed 50 characters'],
      required: true,
      trim: true,
    },
    dayNumber: {
      type: Number,
      min: [1, 'Workout day must be at least 1'],
    },
    sessionStatus: {
      type: String,
      enum: SESSION_COMPLETION_STATUSES,
      required: true,
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
          sets: {
            type: [
              {
                setType: {
                  type: String,
                  enum: SET_TYPES,
                  default: 'straight set',
                  required: true,
                  lowercase: true,
                },
                reps: {
                  type: Number,
                  min: [1, 'Reps must be at least 1'],
                  max: [100, 'Reps cannot exceed 100'],
                  required: true,
                },
                weight: {
                  type: Number,
                  min: [0, 'Weight cannot be negative'],
                  required: true,
                },
                rir: {
                  type: Number,
                  min: [0, 'Rir cannot be negative'],
                  max: [10, 'Rir cannot exceed 10'],
                  required: true,
                },
                setCompleted: {
                  type: Boolean,
                  default: false,
                },
              },
            ],

            validate: {
              validator: (arr: unknown[]) => arr.length > 0,
              message: 'Exercise must have at least 1 set',
            },
          },

          feedback: {
            reportedMMC: {
              type: Number,
              min: 1,
              max: 5,
              required: false,
            },
            reportedPump: {
              type: Number,
              min: 1,
              max: 5,
              required: false,
            },
            reportedTension: {
              type: Number,
              min: 1,
              max: 5,
              required: false,
            },

            reportedCardioFatigue: {
              type: Number,
              min: 1,
              max: 5,
              required: false,
            },
            reportedJointFatigue: {
              type: Number,
              min: 1,
              max: 5,
              required: false,
            },
            reportedSystemicFatigue: {
              type: Number,
              min: 1,
              max: 5,
              required: false,
            },
          },
          notes: { type: String, maxlength: [999, 'Notes cannot exceed 999 characters'] },
        },
      ],
      validate: {
        validator: (arr: unknown[]) => arr.length > 0,
        message: 'Workout must have at least 1 exercise',
      },
    },

    datePerformed: {
      type: Date,
      required: true,
      default: Date.now,
    },
    sessionDuration: {
      type: Number,
      min: [0, 'Duration cannot be negative'],
      max: [600, 'Duration limit exceeded (10 hours)'],
    },
    notes: { type: String, maxlength: [999, 'Notes cannot exceed 999 characters'] },

    algorithmNotes: String,
    algorithmData: {
      version: String,
      decisions: mongoose.Schema.Types.Mixed,
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

sessionSchema.index({ userId: 1, datePerformed: -1 });
sessionSchema.index({ programId: 1 });
sessionSchema.index({ userId: 1, 'exercises.exerciseId': 1 });

sessionSchema.methods.calculateTotalVolume = function (): number {
  let totalVolume = 0;

  for (const exercise of this.exercises) {
    for (const set of exercise.sets) {
      totalVolume += set.weight * set.reps;
    }
  }

  return totalVolume;
};

sessionSchema.statics.getRecentSessions = async function (
  userId: Types.ObjectId | string,
  limit = 10,
): Promise<HydratedDocument<Session, ISessionMethods>[]> {
  if (!userId) {
    throw new Error('userId is required');
  }

  return await this.find({ userId, sessionStatus: 'completed' })
    .sort({ datePerformed: -1 })
    .limit(limit);
};

sessionSchema.statics.getExerciseHistory = async function (
  userId: Types.ObjectId | string,
  exerciseId: Types.ObjectId | string,
  limit = 20,
): Promise<HydratedDocument<Session, ISessionMethods>[]> {
  if (!userId || !exerciseId) {
    throw new Error('userId and exerciseId required');
  }

  return await this.find({
    userId,
    'exercises.exerciseId': exerciseId,
    sessionStatus: 'completed',
  })
    .sort({ datePerformed: -1 })
    .limit(limit);
};

sessionSchema.plugin(mongoosePaginate);

export type Session = InferSchemaType<typeof sessionSchema>;

export const SessionModel = mongoose.model<Session, ISessionModel & PaginateModel<Session>>(
  'Session',
  sessionSchema,
);
