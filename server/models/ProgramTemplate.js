const mongoose = require('mongoose');

const programTemplateSchema = new mongoose.Schema({
  // === PROGRAM METADATA ===

  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },

  createdBy: {
    type: String,
    minlength: [2, 'Owner name must be at least 2 characters'],
    maxlength: [50, 'Owner name cannot exceed 50 characters'],
    trim: true,
    required: true,
  },

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
    min: [1, 'Must have at least 1 day per week'],
    max: [14, 'Session number per week cannot exceed 14'],
    required: true,
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
          message: 'RIR progression must match week count and be between 0-10',
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

        exercises: {
          type: [
            {
              exerciseId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Exercise',
                required: true,
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
                maxlength: [500, 'Text cannot exceed 500 characters'],
              },
              order: {
                type: Number,
                required: true,
                min: [1, 'Order must start at 1'],
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

  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('ProgramTemplate', programTemplateSchema);
