const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const MUSCLE_GROUPS = [
  'chest',
  'back',
  'biceps',
  'triceps',
  'shoulders',
  'forearms',
  'quads',
  'hamstrings',
  'glutes',
  'calves',
  'abs',
  'traps',
  'lats',
];

const MOVEMENT_PATTERNS = [
  // Push patterns
  'horizontal_push', // bench press, push-ups
  'vertical_push', // overhead press, military press
  'incline_push', // incline bench, incline db press

  // Pull patterns
  'horizontal_pull', // rows, face pulls
  'vertical_pull', // pull-ups, lat pulldowns

  // Lower body patterns
  'squat', // squats, leg press, lunges
  'hip_hinge', // deadlifts, RDLs, good mornings

  // Isolation patterns
  'elbow_flexion', // bicep curls
  'elbow_extension', // tricep extensions
  'side_shoulder_isolation', // lateral raises
  'rear_shoulder_isolation', // rear delts
  'quad_isolation', // leg extensions
  'hamstring_isolation', // leg curls
  'glute_isolation', // hip thrusts
  'calf_isolation', // calf raises

  // Core/Carry
  'core', // planks, ab wheel, crunches
  'carry', // farmer's walks, suitcase carries
];

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    equipment: {
      type: String,
      enum: {
        values: [
          'barbell',
          'dumbbell',
          'cable',
          'machine',
          'bodyweight',
          'bands',
          'kettlebell',
          'none',
        ],
        message: '{VALUE} is not valid, must be equipment type',
      },
      required: true,
      lowercase: true,
      default: 'none',
    },

    primaryMuscle: {
      type: String,
      enum: {
        values: MUSCLE_GROUPS,
        message: '{VALUE} is not valid, must be muscle group',
      },
      required: true,
      lowercase: true,
    },

    secondaryMuscles: {
      type: [String],
      enum: {
        values: MUSCLE_GROUPS,
        message: '{VALUE} is not valid, must be muscle group',
      },
      lowercase: true,
      default: [],
      validate: {
        validator: (arr) => arr.length <= 3,
        message: 'Maximum of 3 secondary muscle groups',
      },
    },

    category: {
      type: String,
      enum: {
        values: ['compound', 'isolation'],
        message: '{VALUE} is not valid, must be exercise type',
      },
      required: true,
      lowercase: true,
    },

    movementPattern: {
      type: String,
      enum: {
        values: MOVEMENT_PATTERNS,
        message: '{VALUE} is not valid, must be movement pattern',
      },
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
      enum: {
        values: ['repetitions', 'weight', 'sets'],
        message: '{VALUE} is not valid, must be progression type',
      },
      default: 'weight',
      lowercase: true,
      // consider required
    },

    progressionIncrement: {
      type: Number,
      default: function () {
        return this.progressionType === 'weight' ? 2.5 : 1;
      },
      validate: {
        validator: function (value) {
          if (this.progressionType === 'weight') {
            return value >= 1 && value <= 10;
          } else {
            return value >= 1 && value <= 5;
          }
        },
        message: 'Invalid progression increment for type',
      },
    },

    instructions: {
      type: String,
      maxlength: [500, 'Instructions cannot exceed 500 characters'],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

exerciseSchema.index({ primaryMuscle: 1 });
exerciseSchema.index({ equipment: 1 });
exerciseSchema.index({ name: 'text' });

exerciseSchema.plugin(mongoosePaginate);

module.exports = {
  Exercise: mongoose.model('Exercise', exerciseSchema),
  MUSCLE_GROUPS,
  MOVEMENT_PATTERNS,
};
