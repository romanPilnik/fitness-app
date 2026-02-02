import { Schema, Types,model , HydratedDocument,PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { IExerciseStats } from '../interfaces';
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

interface IExerciseStatsMethods {
  updateLastPerformed(sessionData: SessionData): this;
  addSessionToHistory(sessionSummary: SessionSummary): this;
  updatePersonalRecord(data: PersonalRecordData) :this;
  getRecentSessions(): IExerciseStats['recentSessions'];
}

interface ExerciseStatsModelType extends PaginateModel<ExerciseStatsDocument>{
  getOrCreateProfile(this: ExerciseStatsModelType,userId: string | Types.ObjectId ,exerciseId: string| Types.ObjectId):Promise<HydratedDocument<IExerciseStats,IExerciseStatsMethods>>;
  getActiveProfiles(userId:string | Types.ObjectId): Promise<HydratedDocument<IExerciseStats,IExerciseStatsMethods>[]>;
}

export type ExerciseStatsDocument = HydratedDocument<IExerciseStats,IExerciseStatsMethods>;

const exerciseStatsSchema = new Schema<IExerciseStats,ExerciseStatsModelType,IExerciseStatsMethods>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    exerciseId: {
      type: Schema.Types.ObjectId,
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
          type: Schema.Types.ObjectId,
          ref: 'WorkoutSession',
          required: true,
        },
      },
    ],

    metrics: {
      avgDaysBetweenSessions: Number,
      totalSessions: { type: Number, default: 0 },
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
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

exerciseStatsSchema.index({ userId: 1, exerciseId: 1 }, { unique: true });
exerciseStatsSchema.index({ userId: 1, isActive: 1 });

exerciseStatsSchema.methods.updateLastPerformed = function (sessionData: SessionData) {
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

exerciseStatsSchema.methods.addSessionToHistory = function (sessionSummary: SessionSummary) {
  this.recentSessions.unshift(sessionSummary);

  if (this.recentSessions.length > 10) {
    this.recentSessions = this.recentSessions.slice(0, 10);
  }

  return this;
}; 

exerciseStatsSchema.methods.updatePersonalRecord = function (data: PersonalRecordData) {
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

exerciseStatsSchema.methods.getRecentSessions = function (
  limit = 5,
): IExerciseStats['recentSessions'] {
  return this.recentSessions.slice(0, limit);
};

exerciseStatsSchema.statics.getOrCreateProfile = async function (
  userId: Types.ObjectId | string,
  exerciseId: Types.ObjectId | string,
): Promise<HydratedDocument<IExerciseStats,IExerciseStatsMethods>> {
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

exerciseStatsSchema.statics.getActiveProfiles = async function (
  userId: Types.ObjectId | string,
): Promise<HydratedDocument<IExerciseStats, IExerciseStatsMethods>[]> {
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

exerciseStatsSchema.virtual('daysSinceLastPerformed').get(function (): number {
  if (!this.lastPerformed?.date) return -1;
  return Date.now() - this.lastPerformed.date.getTime();
});

exerciseStatsSchema.virtual('volumeLastSession').get(function (): number {
  if (!this.lastPerformed) return 0;
  const { weight, reps, sets } = this.lastPerformed;
  return (weight ?? 0) * (reps ?? 0) * (sets ?? 0);
});

exerciseStatsSchema.plugin(mongoosePaginate as any);



export const ExerciseStatsModel = model<
  IExerciseStats,
  ExerciseStatsModelType
>('ExerciseProfile', exerciseStatsSchema);
