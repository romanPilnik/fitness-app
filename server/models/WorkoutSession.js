const mongoose = require("mongoose");

const WorkoutSessionSchema = new mongoose.Schema(
  {
    // === RELATIONSHIPS ===
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProgram",
      required: true,
    },

    // === SESSION DETAILS ===
    workoutName: {
      type: String,
      maxlength: [35, "Name is too long"],
      required: true,
      trim: true,
    },
    dayNumber: {
      type: Number,
      min: [1, "Workout day must be at least 1"],
    },
    sessionStatus: {
      type: String,
      enum: {
        values: ["completed", "partially", "skipped"],
        message: "{VALUE} is not valid. Use completed, partially or skipped",
      },
      required: true,
    },

    // === PERFORMED EXERCISES ===
    exercises: {
      type: [
        {
          // exercise reference
          exerciseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exercise",
            required: true,
          },
          order: {
            type: Number,
            required: true,
            min: [1, "Order must start at 1"],
          },
          completionStatus: {
            type: String,
            enum: {
              values: ["completed", "partially", "skipped"],
              message:
                "{VALUE} is not valid. Use completed, partially or skipped",
            },
            default: "completed",
          },
          // performance data
          sets: {
            type: [
              {
                setType: {
                  type: String,
                  enum: {
                    values: [
                      "straight set",
                      "drop set",
                      "super set",
                      "myoreps",
                      "myorep match",
                      "giant set",
                      "cluster set",
                    ],
                    message: "{VALUE} is not valid, Must be type of set", // for self
                  },
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
                  required: true,
                },
                rir: {
                  type: Number,
                  min: [0, "Rir cannot be negative"],
                  max: [10, "Rir cannot exceed 10"],
                  required: true,
                },
              },
            ],

            validate: {
              validator: function (arr) {
                return arr.length > 0;
              },
              message: "Exercise must have atleast 1 set",
            },
          },

          // User feedback (for SFR calculation later)
          feedback: {
            // Stimulus indicators
            reportedMMC: {
              type: Number,
              min: 1,
              max: 5,
              required: false,
            },
            reportedPump: {
              type: Number,
              min: 1,
              max: 5,
              required: false,
            },
            reportedTension: {
              type: Number,
              min: 1,
              max: 5,
              required: false,
            },

            // Fatigue indicators
            reportedCardioFatigue: {
              type: Number,
              min: 1,
              max: 5,
              required: false,
            },
            reportedJointFatigue: {
              type: Number,
              min: 1,
              max: 5,
              required: false,
            },
            reportedSystemicFatigue: {
              type: Number,
              min: 1,
              max: 5,
              required: false,
            },
          },
          notes: { type: String, maxlength: [500, "Text is too long"] },
        },
      ],
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: "Workout must have at least 1 exercise",
      },
    },

    // === TIMING & METADATA ===
    timePerformed: {
      type: Date,
      required: true,
      default: Date.now,
    },
    sessionDuration: {
      type: Number,
      min: [0, "Duration cannot be negative"],
      max: [600, "Duration limit exceeded (10 hours)"],
    },
    notes: { type: String, maxlength: [999, "Text is too long"] },

    // === ALGORITHM DATA ===
    algorithmNotes: String, // Human-readable decisions
    algorithmData: {
      // Structured data for debugging/analysis
      version: String,
      decisions: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// === INDEXES FOR QUERY PERFORMANCE ===
WorkoutSessionSchema.index({ userId: 1, timePerformed: -1 }); // Recent sessions
WorkoutSessionSchema.index({ programId: 1 }); // Sessions for program
WorkoutSessionSchema.index({ userId: 1, "exercises.exerciseId": 1 }); // Exercise history

module.exports = mongoose.model("WorkoutSession", WorkoutSessionSchema);
