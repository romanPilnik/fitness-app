import mongoose, { Schema, Types } from 'mongoose';
import type { InferSchemaType, PaginateModel, Model, HydratedDocument } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { REP_RANGES } from '../types/enums.types.js';

interface SessionData {
  weight: number;
  reps: number;
  sets: number;
  date?: Date;
}

interface PersonalRecordData {
  weight: number;
  reps: number;
}

interface SessionSummary {
  date: Date;
  topSetWeight: number;
  topSetReps: number;
  totalSets: number;
  sessionId: Types.ObjectId;
}

const MAX_RECENT_SESSIONS = 10;

interface IExerciseProfileMethods {
  getProgressionRate(): number;
  getRecentSessions(_limit?: number): ExerciseProfile['recentSessions'];
  updateLastPerformed(_sessionData: SessionData): this;
  addSessionToHistory(_sessionSummary: SessionSummary): this;
  updatePersonalRecord(_data: PersonalRecordData): this;
}

interface IExerciseProfileModel extends Model<ExerciseProfile, object, IExerciseProfileMethods> {
  getOrCreateProfile(
    _userId: Types.ObjectId | string,
    _exerciseId: Types.ObjectId | string,
  ): Promise<HydratedDocument<ExerciseProfile, IExerciseProfileMethods>>;
  getActiveProfilesForUser(
    _userId: Types.ObjectId | string,
  ): Promise<HydratedDocument<ExerciseProfile, IExerciseProfileMethods>[]>;
}

const exerciseProfileSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true,
    },

    lastPerformed: {
      date: Date,

      weight: {
        type: Number,
        min: [0, 'Weight must be at least 0'],
        max: [999, 'Weight cannot exceed 999 kg'],
      },

      reps: {
        type: Number,
        min: [1, 'Reps must be at least 1'],
        max: [50, 'Reps cannot exceed 50'],
      },

      sets: {
        type: Number,
        min: [1, 'Sets must be at least 1'],
        max: [20, 'Sets cannot exceed 20'],
      },
    },

    personalRecord: {
      weight: {
        type: Number,
        min: [0, 'Weight must be at least 0'],
        max: [999, 'Weight cannot exceed 999 kg'],
        default: 0,
      },
      reps: {
        type: Number,
        min: [1, 'Reps must be at least 1'],
        max: [50, 'Reps cannot exceed 50'],
      },
      date: Date,
    },

    recentProgression: {
      attempts: { type: Number, default: 0 },
      successes: { type: Number, default: 0 },
      lastProgressionDate: Date,
    },

    recentSessions: [
      {
        date: Date,

        topSetWeight: {
          type: Number,
          min: [0, 'Weight cannot be negative'],
          max: [999, 'Weight cannot exceed 999 kg'],
        },

        topSetReps: {
          type: Number,
          min: [1, 'Reps must be at least 1'],
          max: [50, 'Reps cannot exceed 50'],
        },

        totalSets: {
          type: Number,
          min: [1, 'Sets must be at least 1'],
          max: [50, 'Sets cannot exceed 50'],
        },
        sessionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'WorkoutSession',
          required: true,
        },
      },
    ],

    metrics: {
      avgDaysBetweenSessions: Number,
      totalSessions: { type: Number, default: 0 },
      bestWorkingSets: [
        {
          repRange: {
            type: String,
            enum: REP_RANGES,
          },
          weight: Number,
          date: Date,
        },
      ],
    },

    difficultyRating: { type: Number, min: 1, max: 5 },
    enjoymentRating: { type: Number, min: 1, max: 5 },
    formNotes: {
      type: String,
      maxlength: [999, 'Notes cannot exceed 999 characters'],
    },
    injuryNotes: {
      type: String,
      maxlength: [999, 'Notes cannot exceed 999 characters'],
    },

    isActive: { type: Boolean, default: true },
    isFavorite: { type: Boolean, default: false },
    needsFormCheck: { type: Boolean, default: false },
    isInjuryModified: { type: Boolean, default: false },
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

exerciseProfileSchema.index({ userId: 1, exerciseId: 1 }, { unique: true });
exerciseProfileSchema.index({ userId: 1, isActive: 1 });

exerciseProfileSchema.methods.getProgressionRate = function (): number {
  if (this.recentProgression.attempts === 0) {
    return 0;
  }
  return Number(
    ((this.recentProgression.successes / this.recentProgression.attempts) * 100).toFixed(1),
  );
};

exerciseProfileSchema.methods.updateLastPerformed = function (sessionData: SessionData) {
  if (!sessionData || typeof sessionData !== 'object') {
    throw new Error('Session data is required and must be an object');
  }

  const { weight, reps, sets, date } = sessionData;

  if (weight === undefined || reps === undefined || sets === undefined) {
    throw new Error('Session data must include weight, reps, and sets');
  }

  this.lastPerformed = {
    date: date || new Date(),
    weight: Number(weight),
    reps: Number(reps),
    sets: Number(sets),
  };

  this.metrics.totalSessions = (this.metrics.totalSessions || 0) + 1;

  return this;
};

exerciseProfileSchema.methods.addSessionToHistory = function (sessionSummary: SessionSummary) {
  this.recentSessions.unshift(sessionSummary);

  if (this.recentSessions.length > MAX_RECENT_SESSIONS) {
    this.recentSessions = this.recentSessions.slice(0, MAX_RECENT_SESSIONS);
  }

  return this;
};

exerciseProfileSchema.methods.updatePersonalRecord = function (data: PersonalRecordData) {
  const { weight, reps } = data;
  const currentWeight = this.personalRecord?.weight ?? 0;
  const currentReps = this.personalRecord?.reps ?? 0;

  const isNewRecord =
    currentWeight === 0 ||
    weight > currentWeight ||
    (weight === currentWeight && reps > currentReps);

  if (isNewRecord) {
    this.personalRecord = {
      weight: Number(weight),
      reps: Number(reps),
      date: new Date(),
    };
  }

  return this;
};

exerciseProfileSchema.methods.getRecentSessions = function (
  limit = 5,
): ExerciseProfile['recentSessions'] {
  return this.recentSessions.slice(0, limit);
};

exerciseProfileSchema.statics.getOrCreateProfile = async function (
  userId: Types.ObjectId | string,
  exerciseId: Types.ObjectId | string,
): Promise<HydratedDocument<ExerciseProfile, IExerciseProfileMethods>> {
  if (!userId || !exerciseId) {
    throw new Error('userId and exerciseId are required');
  }

  let profile = await this.findOne({ userId, exerciseId });

  if (!profile) {
    profile = await this.create({
      userId,
      exerciseId,
    });
  }

  return profile;
};

exerciseProfileSchema.statics.getActiveProfilesForUser = async function (
  userId: Types.ObjectId | string,
): Promise<HydratedDocument<ExerciseProfile, IExerciseProfileMethods>[]> {
  if (!userId) {
    throw new Error('userId is required');
  }

  const profiles = await this.find({
    userId,
    isActive: true,
  })
    .populate('exerciseId', 'name primaryMuscle equipment')
    .sort({ 'lastPerformed.date': -1 });

  return profiles;
};

exerciseProfileSchema.virtual('daysSinceLastPerformed').get(function (): number {
  if (!this.lastPerformed?.date) return -1;
  return Date.now() - this.lastPerformed.date.getTime();
});

exerciseProfileSchema.virtual('volumeLastSession').get(function (): number {
  if (!this.lastPerformed) return 0;
  const { weight, reps, sets } = this.lastPerformed;
  return (weight ?? 0) * (reps ?? 0) * (sets ?? 0);
});

exerciseProfileSchema.plugin(mongoosePaginate);

export type ExerciseProfile = InferSchemaType<typeof exerciseProfileSchema>;

export const ExerciseProfileModel = mongoose.model<
  ExerciseProfile,
  IExerciseProfileModel & PaginateModel<ExerciseProfile>
>('ExerciseProfile', exerciseProfileSchema);
