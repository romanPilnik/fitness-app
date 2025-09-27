const mongoose = require("mongoose");

const userProgramSchema = new mongoose.Schema(
  {
    // === OWNERSHIP & SOURCE ===
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

    // === PROGRAM METADATA ===
    name: {
      type: String,
      required: true,
      trim: true,
    },
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

    // === PROGRAM STRUCTURE ===
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
            targetReps: { type: Number, required: true },
            notes: String,
            order: { type: Number, required: true },
          },
        ],
      },
    ],

    // === PERIODIZATION CONFIG ===
    periodization: {
      type: {
        type: String,
        enum: ["linear_rir", "dup", "block"], // placeholders
        required: true,
        default: "linear_rir",
      },
      config: {
        weeks: {
          type: Number,
          min: [1, "Mesocycle must be atleast 1 week"],
          max: [12, "Mesocycle cannot exceed 12 weeks"],
          required: true,
        },
        rirProgression: [Number], // [4,3,3,2,2,1,1,0] for each week
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

    // === USER'S PROGRESS TRACKING ===
    status: {
      type: String,
      enum: ["active", "paused", "completed"],
      default: "active",
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

    // === MODIFICATION TRACKING ===
    isModified: { type: Boolean, default: false },
    lastModified: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
userProgramSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model("UserProgram", userProgramSchema);
