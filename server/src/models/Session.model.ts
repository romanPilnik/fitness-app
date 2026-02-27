import { Document, model, Schema, Types, type PaginateModel } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import {
  SESSION_STATUSES,
  SET_TYPES,
  type SessionStatus,
  type SetType,
} from "../types/enums.types.js";

export interface ISession {
  userId: string | Types.ObjectId;
  programId?: string | Types.ObjectId;
  workoutName: string;
  dayNumber?: number;
  sessionStatus: SessionStatus;
  exercises: {
    exerciseId: string | Types.ObjectId;
    order: number;
    sets: {
      setType: SetType;
      reps: number;
      weight: number;
      rir: number;
      setCompleted: boolean;
    }[];
    notes?: string;
  }[];
  datePerformed: Date;
  sessionDuration?: number;
  notes?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const sessionSchema = new Schema<SessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    programId: {
      type: Schema.Types.ObjectId,
      ref: "Program",
    },

    workoutName: {
      type: String,
      maxlength: [50, "Name cannot exceed 50 characters"],
      required: true,
      trim: true,
    },
    dayNumber: {
      type: Number,
      min: [1, "Workout day must be at least 1"],
    },
    sessionStatus: {
      type: String,
      enum: SESSION_STATUSES,
      required: true,
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
          sets: {
            type: [
              {
                setType: {
                  type: String,
                  enum: SET_TYPES,
                  default: "straight set",
                  required: true,
                  lowercase: true,
                },
                reps: {
                  type: Number,
                  min: [1, "Reps must be at least 1"],
                  max: [100, "Reps cannot exceed 100"],
                  required: true,
                },
                weight: {
                  type: Number,
                  min: [0, "Weight cannot be negative"],
                  max: [999, "Weight cannot exceed 999"],
                  required: true,
                },
                rir: {
                  type: Number,
                  min: [0, "Rir cannot be negative"],
                  max: [10, "Rir cannot exceed 10"],
                },
                setCompleted: {
                  type: Boolean,
                  default: false,
                },
              },
            ],

            validate: {
              validator: (arr: unknown[]) => arr.length > 0,
              message: "Exercise must have at least 1 set",
            },
          },
          notes: {
            type: String,
            maxlength: [999, "Notes cannot exceed 999 characters"],
          },
        },
      ],
      validate: {
        validator: (arr: unknown[]) => arr.length > 0,
        message: "Workout must have at least 1 exercise",
      },
    },

    datePerformed: {
      type: Date,
      required: true,
      default: Date.now,
    },
    sessionDuration: {
      type: Number,
      min: [0, "Duration cannot be negative"],
      max: [600, "Duration limit exceeded (10 hours)"],
    },
    notes: {
      type: String,
      maxlength: [999, "Notes cannot exceed 999 characters"],
    },

    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

sessionSchema.index({ userId: 1, datePerformed: -1 });
sessionSchema.index({ programId: 1 });
sessionSchema.index({ userId: 1, "exercises.exerciseId": 1 });

sessionSchema.plugin(mongoosePaginate);

export interface SessionDocument extends ISession, Document {}

export const SessionModel = model<
  SessionDocument,
  PaginateModel<SessionDocument>
>("Session", sessionSchema, "Session");
