const mongoose = require('mongoose');
const MAX_RECENT_SESSIONS = 10;

const userExerciseProfileSchema = new mongoose.Schema(
  {
    // === CORE RELATIONSHIPS ===

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

    // === LAST PERFORMANCE ===

    lastPerformed: {
      date: Date,

      weight: {
        type: Number,
        min: [0, 'Weight must be at least bodyweight'],
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

      rir: {
        type: Number,
        min: [0, 'Rir cannot be lower than 0'],
        max: [10, 'Rir cannot be higher than 10'],
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

    // === FUTURE ALGORITHM DATA ===
    algorithmData: mongoose.Schema.Types.Mixed,

    // === PERFORMANCE HISTORY (Last 5-10 Sessions) ===
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

        topSetRir: {
          type: Number,
          min: [0, 'Rir cannot be lower than 0'],
          max: [10, 'Rir cannot be higher than 10'],
        },

        sessionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'WorkoutSession',
          required: true,
        },
      },
    ],

    // === TRAINING METRICS ===
    metrics: {
      // Frequency
      avgDaysBetweenSessions: Number,
      totalSessions: { type: Number, default: 0 },

      // Best working sets
      bestWorkingSets: [
        {
          repRange: {
            type: String,
            enum: ['2-4', '5-7', '8-11', '12-15'],
          },
          weight: Number,
          date: Date,
        },
      ],
    },

    // === USER NOTES & FEEDBACK ===
    userInsights: {
      difficultyRating: { type: Number, min: 1, max: 5 }, // User's perceived difficulty
      enjoymentRating: { type: Number, min: 1, max: 5 }, // Adherence predictor
      formNotes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters'],
      },
      injuryNotes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters'],
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userExerciseProfileSchema.index({ userId: 1, exerciseId: 1 }, { unique: true });
userExerciseProfileSchema.index({ userId: 1, 'status.isActive': 1 });

// === Pre/post hooks ===

// === Instance methods ===

// Get % of successful PRs
userExerciseProfileSchema.methods.getProgressionRate = function () {
  if (this.recentProgression.attempts === 0) {
    return 0;
  }
  return Number(
    (
      (this.recentProgression.successes / this.recentProgression.attempts) *
      100
    ).toFixed(1)
  );
};

// Update profile with latest session performance data
userExerciseProfileSchema.methods.updateLastPerformed = function (sessionData) {
  if (!sessionData || typeof sessionData !== 'object') {
    throw new Error('Session data is required and must be an object');
  }

  const { weight, reps, sets, rir, date } = sessionData;

  if (
    weight === undefined ||
    reps === undefined ||
    sets === undefined ||
    rir === undefined
  ) {
    throw new Error('Session data must include weight, reps, sets, and rir');
  }

  this.lastPerformed = {
    date: date || Date.now(),
    weight: Number(weight),
    reps: Number(reps),
    sets: Number(sets),
    rir: Number(rir),
  };

  this.metrics.totalSessions = (this.metrics.totalSessions || 0) + 1;
  this.recentProgression.lastProgressionDate = this.lastPerformed.date;

  return this;
};

// Update completed workout to last 10 performed
userExerciseProfileSchema.methods.addSessionToHistory = function (
  sessionSummary
) {
  this.recentSessions.unshift(sessionSummary);

  if (this.recentSessions.length > MAX_RECENT_SESSIONS) {
    this.recentSessions = this.recentSessions.slice(0, MAX_RECENT_SESSIONS);
  }

  return this;
};

// Get custom number of recent sessions
userExerciseProfileSchema.methods.getRecentSessions = function (limit = 5) {
  return this.recentSessions.slice(0, limit);
};

// === Static methods ===

// Find existing profile or create new one
userExerciseProfileSchema.statics.getOrCreateProfile = async function (
  userId,
  exerciseId
) {
  // Validate required parameters
  if (!userId || !exerciseId) {
    throw new Error('userId and exerciseId are required');
  }

  // Try to find existing profile
  let profile = await this.findOne({ userId, exerciseId });

  // If doesn't exist, create with defaults
  if (!profile) {
    profile = await this.create({
      userId,
      exerciseId,
      // All other fields use schema defaults
    });
  }

  return profile;
};

// Get all active profiles for a user
userExerciseProfileSchema.statics.getActiveProfilesForUser = async function (
  userId
) {
  if (!userId) {
    throw new Error('userId is required');
  }

  const profiles = await this.find({
    userId,
    'status.isActive': true,
  })
    .populate('exerciseId', 'name primaryMuscle equipment')
    .sort({ 'lastPerformed.date': -1 });

  return profiles;
};

// === Virtual Fields ===

userExerciseProfileSchema.virtual('daysSinceLastPerformed').get(function () {
  return Date.now - this.lastPerformed.date;
});

userExerciseProfileSchema.virtual('volumeLastSession').get(function () {
  return (
    this.lastPerformed.weight *
    this.lastPerformed.reps *
    this.lastPerformed.sets
  );
});

module.exports = mongoose.model(
  'UserExerciseProfile',
  userExerciseProfileSchema
);
