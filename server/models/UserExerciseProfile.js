const mongoose = require("mongoose");

const userExerciseProfileSchema = new mongoose.Schema(
  {
    // === CORE RELATIONSHIPS ===

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
    },

    // === LAST PERFORMANCE ===

    lastPerformed: {
      date: Date,

      weight: {
        type: Number,
        min: [0, "Weight must be at least bodyweight"],
        max: [999, "Weight cannot exceed 999 kg"],
      },

      rep: {
        type: Number,
        min: [1, "Reps must be at least 1"],
        max: [50, "Reps cannot exceed 50"],
      },

      sets: {
        type: Number,
        min: [1, "Sets must be at least 1"],
        max: [20, "Sets cannot exceed 20"],
      },

      rir: {
        type: Number,
        min: [0, "Rir cannot be lower than 0"],
        max: [10, "Rir cannot be higher than 10"],
      },
    },

    // === PERSONAL RECORDS ===
    personalRecords: {
      // Might adjust
      weight: { value: Number, date: Date }, /// should be validated already
      reps: { value: Number, date: Date },
      volume: { value: Number, date: Date },
    },

    // === PROGRESSION TRACKING ===
    recentProgression: {
      attempts: { type: Number, default: 0 },
      successes: { type: Number, default: 0 },
      lastProgressionDate: Date,
    },

    // === USER PREFERENCES ===
    recentProgression: {
      attempts: { type: Number, default: 0 },
      successes: { type: Number, default: 0 },
      lastProgressionDate: Date,
    },

    // === FUTURE ALGORITHM DATA ===
    algorithmData: mongoose.Schema.Types.Mixed,

    // === PERFORMANCE HISTORY (Last 5-10 Sessions) ===
    recentSessions: [
      {
        date: Date,

        avgWeight: {
          type: Number,
          min: [0, "Weight must be at least bodyweight"],
          max: [999, "Weight cannot exceed 999 kg"],
        },

        avgReps: {
          type: Number,
          min: [1, "Reps must be at least 1"],
          max: [50, "Reps cannot exceed 50"],
        },

        totalSets: {
          type: Number,
          min: [1, "Sets must be at least 1"],
          max: [20, "Sets cannot exceed 20"],
        },

        avgRir: {
          type: Number,
          min: [0, "Rir cannot be lower than 0"],
          max: [10, "Rir cannot be higher than 10"],
        },

        sessionId: mongoose.Schema.Types.ObjectId,
      },
    ],

    // === TRAINING METRICS ===
    metrics: {
      // Frequency
      avgDaysBetweenSessions: Number,
      totalSessions: { type: Number, default: 0 },

      // Performance stability
      isPlateaued: { type: Boolean, default: false }, // No progress in 3+ sessions
      plateauCount: { type: Number, default: 0 },

      // Best working sets (not quite PRs)
      bestWorkingSets: {
        "2-4reps": { weight: Number, date: Date }, // should be validated already
        "5-7reps": { weight: Number, date: Date },
        "8-11reps": { weight: Number, date: Date },
        "12-15reps": { weight: Number, date: Date },
      },
    },

    // === USER NOTES & FEEDBACK ===
    userInsights: {
      difficultyRating: { type: Number, min: 1, max: 5 }, // User's perceived difficulty
      enjoymentRating: { type: Number, min: 1, max: 5 }, // Adherence predictor
      formNotes: {
        type: String,
        maxlength: [500, "Notes cannot exceed 500 characters"],
      },
      injuryNotes: {
        type: String,
        maxlength: [500, "Notes cannot exceed 500 characters"],
      },
    },

    // === STATUS FLAGS ===
    status: {
      isActive: { type: Boolean, default: true },
      isFavorite: { type: Boolean, default: false },
      needsFormCheck: { type: Boolean, default: false },
      isInjuryModified: { type: Boolean, default: false },
    },
  },

  {
    timestamps: true,
  }
);

userExerciseProfileSchema.index({ userId: 1, exerciseId: 1 }, { unique: true });

module.exports = mongoose.model(
  "UserExerciseProfile",
  userExerciseProfileSchema
);
