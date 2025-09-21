const mongoose = require("mongoose");

const programTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  createdBy: String,
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
        triggerAfterFailures: { type: Number, default: 2 }, // Deload if 2 sessions without progress
        fatigueThreshold: { type: Number, default: 8 }, // 1-10 scale from feedback
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
  description: String,

  difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"] },

  goals: [{ type: String, enum: ["strength", "hypertrophy", "endurance"] }],

  defaultSets: {
    type: Number,
    default: 3,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("ProgramTemplate", programTemplateSchema);
