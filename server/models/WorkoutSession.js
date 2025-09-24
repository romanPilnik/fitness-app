const mongoose = require("mongoose");

const WorkoutSessionSchema = new mongoose.Schema(
  {
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

    workoutName: String,
    dayNumber: { type: Number },

    exercises: [
      {
        exerciseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Exercise",
          required: true,
        },
        completionStatus: {
          type: String,
          enum: ["completed", "partially", "skipped"],
          default: "completed",
        },

        sets: [
          {
            setType: {
              type: String,
              enum: [
                "straight set",
                "drop set",
                "super set",
                "myoreps",
                "myorep match",
                "giant set",
                "cluster set",
              ],
              default: "straight set",
            },
            reps: { type: Number, required: true },
            weight: { type: Number, required: true },
            rir: { type: Number, min: 0, max: 10 },
          },
        ],
        feedback: {
          reportedMMC: { type: Number, min: 1, max: 5 },
          reportedPump: { type: Number, min: 1, max: 5 },
          reportedTension: { type: Number, min: 1, max: 5 },
          reportedCardioFatigue: { type: Number, min: 1, max: 5 },
          reportedJointFatigue: { type: Number, min: 1, max: 5 },
          reportedSystemicFatigue: { type: Number, min: 1, max: 5 },
        },
        notes: String,
        order: { type: Number, required: true },
      },
    ],

    sessionStatus: {
      type: String,
      enum: ["completed", "partial", "skipped"],
      required: true,
    },

    timePerformed: {
      type: Date,
      required: true,
      default: Date.now, // Add this for convenience
    },

    sessionDuration: {
      type: Number, // Total minutes
      min: 0,
    },
    notes: String,
    algorithmNotes: String, // "Increased weight due to 3 weeks progression"
    // Or more structured:
    algorithmData: {
      version: String,
      decisions: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

WorkoutSessionSchema.index({ userId: 1, timePerformed: -1 }); // Recent sessions
WorkoutSessionSchema.index({ programId: 1 }); // Sessions for program
WorkoutSessionSchema.index({ userId: 1, "exercises.exerciseId": 1 }); // Exercise history

module.exports = mongoose.model("WorkoutSession", WorkoutSessionSchema);
