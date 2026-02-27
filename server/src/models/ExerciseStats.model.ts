import { type PaginateModel, Document, model, Schema, Types } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface IExerciseStats {
  userId: string | Types.ObjectId;
  exerciseId: string | Types.ObjectId;

  lastPerformed?: {
    date: Date;
    weight: number;
    reps: number;
    sets: number;
  };

  personalRecord?: {
    weight: number;
    reps: number;
    date: Date;
  };

  recentSessions: {
    date: Date;
    topSetWeight: number;
    topSetReps: number;
    totalSets: number;
    sessionId: string | Types.ObjectId;
  }[];

  metrics: {
    avgDaysBetweenSessions?: number;
    totalSessions: number;
  };

  difficultyRating?: number;
  enjoymentRating?: number;
  formNotes?: string;
  injuryNotes?: string;
  isActive: boolean;
  isFavorite: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const exerciseStatsSchema = new Schema<ExerciseStatsDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
    },

    lastPerformed: {
      date: Date,

      topSetWeight: {
        type: Number,
        min: [0, "Weight must be at least 0"],
        max: [999, "Weight cannot exceed 999 kg"],
      },

      topSetReps: {
        type: Number,
        min: [1, "Reps must be at least 1"],
        max: [50, "Reps cannot exceed 50"],
      },

      totalSets: {
        type: Number,
        min: [1, "Sets must be at least 1"],
        max: [20, "Sets cannot exceed 20"],
      },
    },

    personalRecord: {
      weight: {
        type: Number,
        min: [0, "Weight must be at least 0"],
        max: [999, "Weight cannot exceed 999 kg"],
      },
      reps: {
        type: Number,
        min: [1, "Reps must be at least 1"],
        max: [50, "Reps cannot exceed 50"],
      },
      date: Date,
    },

    recentSessions: [
      {
        date: Date,

        topSetWeight: {
          type: Number,
          min: [0, "Weight cannot be negative"],
          max: [999, "Weight cannot exceed 999 kg"],
        },

        topSetReps: {
          type: Number,
          min: [1, "Reps must be at least 1"],
          max: [50, "Reps cannot exceed 50"],
        },

        totalSets: {
          type: Number,
          min: [1, "Sets must be at least 1"],
          max: [50, "Sets cannot exceed 50"],
        },
        sessionId: {
          type: Schema.Types.ObjectId,
          ref: "Session",
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
      maxlength: [999, "Notes cannot exceed 999 characters"],
    },
    injuryNotes: {
      type: String,
      maxlength: [999, "Notes cannot exceed 999 characters"],
    },

    isActive: { type: Boolean, default: true },
    isFavorite: { type: Boolean, default: false },
  },

  {
    timestamps: true,
  },
);

exerciseStatsSchema.index({ userId: 1, exerciseId: 1 }, { unique: true });
exerciseStatsSchema.index({ userId: 1, isActive: 1 });

exerciseStatsSchema.plugin(mongoosePaginate);

export interface ExerciseStatsDocument extends IExerciseStats, Document {}

export const ExerciseStatsModel = model<
  ExerciseStatsDocument,
  PaginateModel<ExerciseStatsDocument>
>("ExerciseStats", exerciseStatsSchema, "ExerciseStats");
