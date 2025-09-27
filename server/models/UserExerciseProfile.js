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

    // === LAST PERFORMANCE (Always Useful) ===

    lastPerformed: {
      date: Date,
      weight: Number,
      rep: Number,
      sets: Number,
      rir: Number,
    },

    // === PERSONAL RECORDS ===
    personalRecords: {
      // Might adjust
      weight: { value: Number, date: Date },
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
        avgWeight: Number,
        avgReps: Number,
        totalSets: Number,
        avgRir: Number,
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
        "2-4reps": { weight: Number, date: Date },
        "5-7reps": { weight: Number, date: Date },
        "8-11reps": { weight: Number, date: Date },
        "12-15reps": { weight: Number, date: Date },
      },
    },

    // === USER NOTES & FEEDBACK ===
    userInsights: {
      difficultyRating: { type: Number, min: 1, max: 5 }, // User's perceived difficulty
      enjoymentRating: { type: Number, min: 1, max: 5 }, // Adherence predictor
      formNotes: String, // "Finally got depth right"
      injuryNotes: String, // "Avoid due to shoulder"
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
