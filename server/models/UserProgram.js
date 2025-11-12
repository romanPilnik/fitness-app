const mongoose = require('mongoose');

const userProgramSchema = new mongoose.Schema(
  {
    // === OWNERSHIP & SOURCE ===
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sourceTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProgramTemplate',
      default: null, // null if custom program
    },
    sourceTemplateName: String, // Cached for display even if template deleted
    createdFrom: {
      type: String,
      enum: {
        values: ['template', 'scratch', 'shared'],
        message: '{VALUE} is not valid, must be the program source',
      },
      default: 'scratch',
      lowercase: true,
      required: true,
    },

    // === PROGRAM METADATA ===
    name: {
      type: String,
      maxlength: [50, 'Name cannot exceed 50 characters'],
      required: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    difficulty: {
      type: String,
      enum: {
        values: ['beginner', 'intermediate', 'advanced'],
        message: '{VALUE} is not valid, must be difficulty',
      },
      required: true,
      lowercase: true,
    },
    goals: {
      type: [
        {
          type: String,
          enum: {
            values: ['strength', 'hypertrophy', 'endurance'],
            message: '{VALUE} is not valid, must a type of goal',
          },
          required: true,
          lowercase: true,
          default: 'hypertrophy',
        },
      ],
      validate: {
        validator: (arr) => arr.length <= 3,
        message: 'Maximum of 3 goals',
      },
    },

    // === PROGRAM STRUCTURE ===
    splitType: {
      type: String,
      enum: {
        values: [
          'full body',
          'push pull legs',
          'upper lower',
          'arnold',
          'modified full body',
          'other',
        ],
        message: '{VALUE} is not valid, must be split type',
      },
      default: 'other',
      required: true,
      lowercase: true,
    },
    daysPerWeek: {
      type: Number,
      max: [14, 'Session number per week cannot exceed 14'],
      required: true,
    },

    workouts: {
      type: [
        {
          name: {
            type: String,
            maxlength: [50, 'Name cannot exceed 50 characters'],
            required: true,
            trim: true,
          },
          dayNumber: {
            type: Number,
            min: [1, 'Workout day must be at least 1'],
          },

          // === PLANNED EXERCISES ===
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
                targetSets: {
                  type: Number,
                  min: [1, 'Sets must be at least 1'],
                  max: [20, 'Sets cannot exceed 20'],
                  required: true,
                },
                targetReps: {
                  type: Number,
                  min: [1, 'Reps must be at least 1'],
                  max: [100, 'Reps cannot exceed 100'],
                  required: true,
                },
                targetRir: {
                  type: Number,
                  min: [0, 'Rir cannot be negative'],
                  max: [10, 'Rir cannot be above 10'],
                  required: true,
                },
                notes: {
                  type: String,
                  maxlength: [500, 'Notes cannot exceed 500 characters'],
                },
              },
            ],
            validate: {
              validator: function (arr) {
                return arr.length > 0;
              },
              message: 'Workout must have atleast 1 exercise',
            },
          },
        },
      ],
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: 'Split must have atleast 1 workout',
      },
    },

    // === PERIODIZATION CONFIG ===
    periodization: {
      type: {
        type: String,
        enum: {
          values: ['linear_rir', 'dup', 'block'],
          message: '{VALUE} is not valid, must be type of periodization',
        }, // placeholders
        required: true,
        default: 'linear_rir',
        lowercase: true,
      },

      config: {
        weeks: {
          type: Number,
          min: [1, 'Mesocycle must be atleast 1 week'],
          max: [12, 'Mesocycle cannot exceed 12 weeks'],
          required: true,
        },

        rirProgression: {
          type: [Number],
          validate: {
            validator: function (arr) {
              // Must match weeks length
              if (
                this.periodization?.config?.weeks &&
                arr.length !== this.periodization.config.weeks
              ) {
                return false;
              }
              // Each value must be valid RIR
              return arr.every((rir) => rir >= 0 && rir <= 10);
            },
            message:
              'RIR progression must match week count and be between 0-10',
          },
        }, // [4,3,3,2,2,1,1,0] for each week

        deloadWeek: {
          type: Number,
          min: [4, 'Deload weeks must be between 4-20'],
          max: [20, 'Deload weeks must be between 4-20'],
          validate: {
            validator: function (value) {
              if (
                this.periodization?.config?.weeks &&
                value > this.periodization.config.weeks
              ) {
                return false;
              }
              return true;
            },
            message: 'Deload week must be within mesocycle duration',
          },
        },

        autoDeload: {
          enabled: { type: Boolean, default: true },

          triggerAfterFailures: {
            type: Number,
            default: 2,
            min: [1, 'Must fail at least 1 session to trigger'],
            max: [5, 'Trigger threshold too high'],
          },

          fatigueThreshold: {
            type: Number,
            default: 8,
            min: [1, 'Fatigue threshold minimum is 1'],
            max: [10, 'Fatigue threshold maximum is 10'],
          },
        },

        volumeProgression: {
          // might not use
          type: String,
          enum: {
            values: ['static', 'ascending', 'wave'],
            message: '{VALUE} is not valid, must be volume progression type',
          },
          default: 'static',
          required: true,
          lowercase: true,
        },
      },
    },

    // === USER'S PROGRESS TRACKING ===
    status: {
      type: String,
      enum: {
        values: ['active', 'paused', 'completed'],
        message: '{VALUE} is not valid, must be status',
      },
      default: 'active',
      required: true,
      lowercase: true,
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
    hasBeenModified: { type: Boolean, default: false },
    lastModified: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
userProgramSchema.index({ userId: 1, status: 1 });

// Instance methods

// Check if it is deload week
userProgramSchema.methods.isDeloadWeek = function () {
  return this.currentWeek === this.periodization.config.deloadWeek;
};

// Get current week RIR
userProgramSchema.methods.getCurrentWeekRIR = function () {
  const index = this.currentWeek - 1;
  const rirArray = this.periodization.config.rirProgression;

  if (index < 0 || index >= rirArray.length) {
    return null;
  }
  // eslint-disable-next-line security/detect-object-injection
  return rirArray[index];
};

// Get next workout
userProgramSchema.methods.getNextWorkout = function () {
  if (!this.workouts || this.workouts.length === 0) {
    return null;
  }
  if (this.nextWorkoutIndex >= this.workouts.length) {
    return this.workouts[0];
  }
  return this.workouts[this.nextWorkoutIndex];
};

// Static methods

// Find user's active program (if exists)
userProgramSchema.statics.findActiveProgram = async function (userId) {
  if (!userId) {
    throw new Error('userId is required');
  }

  return await this.findOne({
    userId,
    status: 'active',
  });
};

// Virtual field ideas: current week target rir,weeks remaining, progressPercentage.

userProgramSchema.virtual('progressPercentage').get(function () {
  return (this.currentWeek / this.periodization.config.weeks) * 100;
});

userProgramSchema.virtual('weeksRemaining').get(function () {
  return this.periodization.config.weeks - this.currentWeek;
});

userProgramSchema.virtual('isComplete').get(function () {
  return this.currentWeek > this.periodization.config.weeks;
});

module.exports = mongoose.model('UserProgram', userProgramSchema);
