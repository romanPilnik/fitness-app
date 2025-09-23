const mongoose = require("mongoose");

const userProgramSchema = new mongoose.Schema(
  {
    //belongs to user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sourceTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProgramTemplate",
      default: null, // null if custom program
    },
    sourceTemplateName: String, // Cached for display even if template deleted
    createdFrom: {
      type: String,
      enum: ["template", "scratch", "shared"],
      default: "scratch",
    },

    // User's instance data
    startDate: {
      type: Date,
      default: Date.now,
    },
    currentWeek: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["active", "paused", "completed"],
      default: "active",
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },
    splitType: {
      type: String,
      enum: [
        "full body",
        "push pull legs",
        "upper lower",
        "arnold",
        "modified full body",
        "other",
      ],
      default: "other",
      required: true,
      lowercase: true,
    },
    daysPerWeek: {
      type: Number,
      required: true,
    },
    periodization: {
      type: {
        type: String,
        enum: ["linear_rir", "dup", "block"],
        default: "linear_rir",
      },
      config: {
        weeks: Number, // Mesocycle length
        rirProgression: [Number], // [4,3,2,1,0,0,5] for each week
        deloadWeek: Number,

        autoDeload: {
          enabled: { type: Boolean, default: true },
          triggerAfterFailures: { type: Number, default: 2 },
          fatigueThreshold: { type: Number, default: 8 },
        },
        volumeProgression: {
          // might not use
          type: String,
          enum: ["static", "ascending", "wave"],
          default: "static",
        },
      },
    },
    workouts: [
      {
        name: { type: String, required: true },
        dayNumber: { type: Number },
        exercises: [
          {
            exerciseId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Exercise",
              required: true,
            },
            targetSets: { type: Number, required: true },
            targetReps: { type: String, required: true },
            notes: String,
            order: { type: Number, required: true },
          },
        ],
      },
    ],
    nextWorkoutIndex: {
      type: Number,
      default: 0,
    },
    // Modification tracking
    isModified: { type: Boolean, default: false },
    lastModified: Date,
    description: String,
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
    },
    goals: [
      {
        type: String,
        enum: ["strength", "hypertrophy", "endurance"],
      },
    ],
    lastCompletedWorkoutDate: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
userProgramSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model("UserProgram", userProgramSchema);
