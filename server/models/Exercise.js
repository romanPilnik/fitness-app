const mongoose = require("mongoose");

const MUSCLE_GROUPS = [
  "chest",
  "back",
  "biceps",
  "triceps",
  "shoulders",
  "forearms",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  "abs",
  "traps",
  "lats",
];

const MOVEMENT_PATTERNS = [
  // Push patterns
  "horizontal_push", // bench press, push-ups
  "vertical_push", // overhead press, military press
  "incline_push", // incline bench, incline db press

  // Pull patterns
  "horizontal_pull", // rows, face pulls
  "vertical_pull", // pull-ups, lat pulldowns

  // Lower body patterns
  "squat", // squats, leg press, lunges
  "hip_hinge", // deadlifts, RDLs, good mornings

  // Isolation patterns
  "elbow_flexion", // bicep curls
  "elbow_extension", // tricep extensions
  "side_shoulder_isolation", // lateral raises
  "rear_shoulder_isolation", // rear delts
  "quad_isolation", // leg extensions
  "hamstring_isolation", // leg curls
  "glute_isolation", // hip thrusts
  "calf_isolation", // calf raises

  // Core/Carry
  "core", // planks, ab wheel, crunches
  "carry", // farmer's walks, suitcase carries
];

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    equipment: {
      type: String,
      enum: [
        "barbell",
        "dumbbell",
        "cable",
        "machine",
        "bodyweight",
        "bands",
        "kettlebell",
        "none",
      ],
      required: true,
    },
    primaryMuscle: {
      type: String,
      enum: MUSCLE_GROUPS,
      required: true,
      lowercase: true,
    },
    secondaryMuscles: {
      type: [String],
      enum: MUSCLE_GROUPS,
      default: [],
    },
    category: {
      type: String,
      enum: ["compound", "isolation"],
      required: true,
      lowercase: true,
    },
    movementPattern: {
      type: String,
      enum: MOVEMENT_PATTERNS,
      required: true,
      lowercase: true,
    },
    typicalRepRange: {
      min: { type: Number, default: 5 },
      max: { type: Number, default: 30 },
    },
    rirBoundaries: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 5 },
    },
    progressionType: {
      type: String,
      enum: ["repetitions", "weight", "sets"],
      default: "weight",
    },
    progressionIncrement: {
      type: Number,
      default: function () {
        return this.progressionType === "weight" ? 5 : 1;
      },
    },
    defaultSets: {
      type: Number,
      default: 3,
    },
    instructions: String,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

exerciseSchema.index({ primaryMuscle: 1 });
exerciseSchema.index({ equipment: 1 });
exerciseSchema.index({ name: "text" }); // Text search

module.exports = mongoose.model("Exercise", exerciseSchema);
