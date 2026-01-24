const mongoose = require('mongoose');
require('dotenv').config();

const { Exercise } = require('../models/Exercise');
const ProgramTemplate = require('../models/ProgramTemplate');
const User = require('../models/User');

const exercises = [
  {
    name: 'Barbell Bench Press',
    equipment: 'barbell',
    primaryMuscle: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    category: 'compound',
    movementPattern: 'horizontal_push',
    typicalRepRange: { min: 5, max: 12 },
    progressionType: 'weight',
    progressionIncrement: 2.5,
  },
  {
    name: 'Barbell Squat',
    equipment: 'barbell',
    primaryMuscle: 'quads',
    secondaryMuscles: ['glutes', 'hamstrings'],
    category: 'compound',
    movementPattern: 'squat',
    typicalRepRange: { min: 5, max: 12 },
    progressionType: 'weight',
    progressionIncrement: 2.5,
  },
  {
    name: 'Conventional Deadlift',
    equipment: 'barbell',
    primaryMuscle: 'back',
    secondaryMuscles: ['hamstrings', 'glutes'],
    category: 'compound',
    movementPattern: 'hip_hinge',
    typicalRepRange: { min: 3, max: 8 },
    progressionType: 'weight',
    progressionIncrement: 2.5,
  },
  {
    name: 'Overhead Press',
    equipment: 'barbell',
    primaryMuscle: 'shoulders',
    secondaryMuscles: ['triceps'],
    category: 'compound',
    movementPattern: 'vertical_push',
    typicalRepRange: { min: 5, max: 12 },
    progressionType: 'weight',
    progressionIncrement: 2.5,
  },
  {
    name: 'Barbell Row',
    equipment: 'barbell',
    primaryMuscle: 'back',
    secondaryMuscles: ['biceps', 'lats'],
    category: 'compound',
    movementPattern: 'horizontal_pull',
    typicalRepRange: { min: 6, max: 12 },
    progressionType: 'weight',
    progressionIncrement: 2.5,
  },
  {
    name: 'Pull Up',
    equipment: 'bodyweight',
    primaryMuscle: 'lats',
    secondaryMuscles: ['biceps', 'back'],
    category: 'compound',
    movementPattern: 'vertical_pull',
    typicalRepRange: { min: 5, max: 15 },
    progressionType: 'repetitions',
    progressionIncrement: 1,
  },
  {
    name: 'Dumbbell Lateral Raise',
    equipment: 'dumbbell',
    primaryMuscle: 'shoulders',
    secondaryMuscles: [],
    category: 'isolation',
    movementPattern: 'side_shoulder_isolation',
    typicalRepRange: { min: 10, max: 20 },
    progressionType: 'weight',
    progressionIncrement: 1,
  },
  {
    name: 'Dumbbell Bicep Curl',
    equipment: 'dumbbell',
    primaryMuscle: 'biceps',
    secondaryMuscles: ['forearms'],
    category: 'isolation',
    movementPattern: 'elbow_flexion',
    typicalRepRange: { min: 8, max: 15 },
    progressionType: 'weight',
    progressionIncrement: 1,
  },
  {
    name: 'Tricep Pushdown',
    equipment: 'cable',
    primaryMuscle: 'triceps',
    secondaryMuscles: [],
    category: 'isolation',
    movementPattern: 'elbow_extension',
    typicalRepRange: { min: 10, max: 20 },
    progressionType: 'weight',
    progressionIncrement: 2.5,
  },
  {
    name: 'Leg Curl',
    equipment: 'machine',
    primaryMuscle: 'hamstrings',
    secondaryMuscles: [],
    category: 'isolation',
    movementPattern: 'hamstring_isolation',
    typicalRepRange: { min: 10, max: 15 },
    progressionType: 'weight',
    progressionIncrement: 2.5,
  },
];

const testUser = {
  email: 'test@test.com',
  password: 'password123',
  name: 'Test User',
  preferences: {
    units: 'metric',
    weekStartsOn: 1,
  },
  role: 'user',
};

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      Exercise.deleteMany({}),
      ProgramTemplate.deleteMany({}),
      User.deleteMany({}),
    ]);
    console.log('Cleared exercises, templates, and users');

    // Create exercises
    console.log('Creating exercises...');
    const createdExercises = await Exercise.insertMany(exercises);
    console.log(`Created ${createdExercises.length} exercises`);

    // Create test user
    console.log('Creating test user...');
    const createdUser = await User.create(testUser);
    console.log(`Created user: ${createdUser.email}`);

    // Create program templates
    console.log('Creating program templates...');
    const templates = [
      {
        name: 'Full Body Strength',
        createdBy: 'System',
        splitType: 'full body',
        daysPerWeek: 3,
        periodization: {
          type: 'linear_rir',
          config: {
            weeks: 4,
            rirProgression: [4, 3, 2, 1],
            volumeProgression: 'static',
          },
        },
        workouts: [
          {
            name: 'Full Body A',
            dayNumber: 1,
            exercises: [
              {
                exerciseId: createdExercises[0]._id,
                targetSets: 4,
                targetReps: 8,
                targetRir: 2,
                order: 1,
              },
              {
                exerciseId: createdExercises[1]._id,
                targetSets: 4,
                targetReps: 8,
                targetRir: 2,
                order: 2,
              },
              {
                exerciseId: createdExercises[4]._id,
                targetSets: 3,
                targetReps: 10,
                targetRir: 2,
                order: 3,
              },
              {
                exerciseId: createdExercises[7]._id,
                targetSets: 3,
                targetReps: 12,
                targetRir: 2,
                order: 4,
              },
            ],
          },
          {
            name: 'Full Body B',
            dayNumber: 2,
            exercises: [
              {
                exerciseId: createdExercises[2]._id,
                targetSets: 4,
                targetReps: 5,
                targetRir: 2,
                order: 1,
              },
              {
                exerciseId: createdExercises[3]._id,
                targetSets: 4,
                targetReps: 8,
                targetRir: 2,
                order: 2,
              },
              {
                exerciseId: createdExercises[5]._id,
                targetSets: 3,
                targetReps: 8,
                targetRir: 2,
                order: 3,
              },
              {
                exerciseId: createdExercises[8]._id,
                targetSets: 3,
                targetReps: 12,
                targetRir: 2,
                order: 4,
              },
            ],
          },
          {
            name: 'Full Body C',
            dayNumber: 3,
            exercises: [
              {
                exerciseId: createdExercises[0]._id,
                targetSets: 3,
                targetReps: 10,
                targetRir: 2,
                order: 1,
              },
              {
                exerciseId: createdExercises[1]._id,
                targetSets: 3,
                targetReps: 10,
                targetRir: 2,
                order: 2,
              },
              {
                exerciseId: createdExercises[6]._id,
                targetSets: 3,
                targetReps: 15,
                targetRir: 2,
                order: 3,
              },
              {
                exerciseId: createdExercises[9]._id,
                targetSets: 3,
                targetReps: 12,
                targetRir: 2,
                order: 4,
              },
            ],
          },
        ],
        description: 'A balanced full body program for building strength',
        difficulty: 'beginner',
        goals: ['strength', 'hypertrophy'],
      },
      {
        name: 'Push Pull Legs',
        createdBy: 'System',
        splitType: 'push pull legs',
        daysPerWeek: 6,
        periodization: {
          type: 'linear_rir',
          config: {
            weeks: 6,
            rirProgression: [4, 3, 3, 2, 2, 1],
            volumeProgression: 'ascending',
          },
        },
        workouts: [
          {
            name: 'Push',
            dayNumber: 1,
            exercises: [
              {
                exerciseId: createdExercises[0]._id,
                targetSets: 4,
                targetReps: 8,
                targetRir: 2,
                order: 1,
              },
              {
                exerciseId: createdExercises[3]._id,
                targetSets: 4,
                targetReps: 8,
                targetRir: 2,
                order: 2,
              },
              {
                exerciseId: createdExercises[6]._id,
                targetSets: 3,
                targetReps: 15,
                targetRir: 2,
                order: 3,
              },
              {
                exerciseId: createdExercises[8]._id,
                targetSets: 3,
                targetReps: 12,
                targetRir: 2,
                order: 4,
              },
            ],
          },
          {
            name: 'Pull',
            dayNumber: 2,
            exercises: [
              {
                exerciseId: createdExercises[4]._id,
                targetSets: 4,
                targetReps: 8,
                targetRir: 2,
                order: 1,
              },
              {
                exerciseId: createdExercises[5]._id,
                targetSets: 4,
                targetReps: 8,
                targetRir: 2,
                order: 2,
              },
              {
                exerciseId: createdExercises[7]._id,
                targetSets: 3,
                targetReps: 12,
                targetRir: 2,
                order: 3,
              },
            ],
          },
          {
            name: 'Legs',
            dayNumber: 3,
            exercises: [
              {
                exerciseId: createdExercises[1]._id,
                targetSets: 4,
                targetReps: 8,
                targetRir: 2,
                order: 1,
              },
              {
                exerciseId: createdExercises[2]._id,
                targetSets: 3,
                targetReps: 5,
                targetRir: 2,
                order: 2,
              },
              {
                exerciseId: createdExercises[9]._id,
                targetSets: 3,
                targetReps: 12,
                targetRir: 2,
                order: 3,
              },
            ],
          },
        ],
        description: 'Classic PPL split for intermediate lifters',
        difficulty: 'intermediate',
        goals: ['hypertrophy'],
      },
      {
        name: 'Upper Lower Split',
        createdBy: 'System',
        splitType: 'upper lower',
        daysPerWeek: 4,
        periodization: {
          type: 'linear_rir',
          config: {
            weeks: 5,
            rirProgression: [4, 3, 2, 2, 1],
            volumeProgression: 'static',
          },
        },
        workouts: [
          {
            name: 'Upper A',
            dayNumber: 1,
            exercises: [
              {
                exerciseId: createdExercises[0]._id,
                targetSets: 4,
                targetReps: 6,
                targetRir: 2,
                order: 1,
              },
              {
                exerciseId: createdExercises[4]._id,
                targetSets: 4,
                targetReps: 8,
                targetRir: 2,
                order: 2,
              },
              {
                exerciseId: createdExercises[3]._id,
                targetSets: 3,
                targetReps: 8,
                targetRir: 2,
                order: 3,
              },
              {
                exerciseId: createdExercises[7]._id,
                targetSets: 3,
                targetReps: 12,
                targetRir: 2,
                order: 4,
              },
              {
                exerciseId: createdExercises[8]._id,
                targetSets: 3,
                targetReps: 12,
                targetRir: 2,
                order: 5,
              },
            ],
          },
          {
            name: 'Lower A',
            dayNumber: 2,
            exercises: [
              {
                exerciseId: createdExercises[1]._id,
                targetSets: 4,
                targetReps: 6,
                targetRir: 2,
                order: 1,
              },
              {
                exerciseId: createdExercises[2]._id,
                targetSets: 3,
                targetReps: 5,
                targetRir: 2,
                order: 2,
              },
              {
                exerciseId: createdExercises[9]._id,
                targetSets: 3,
                targetReps: 12,
                targetRir: 2,
                order: 3,
              },
            ],
          },
          {
            name: 'Upper B',
            dayNumber: 3,
            exercises: [
              {
                exerciseId: createdExercises[0]._id,
                targetSets: 3,
                targetReps: 10,
                targetRir: 2,
                order: 1,
              },
              {
                exerciseId: createdExercises[5]._id,
                targetSets: 4,
                targetReps: 8,
                targetRir: 2,
                order: 2,
              },
              {
                exerciseId: createdExercises[6]._id,
                targetSets: 3,
                targetReps: 15,
                targetRir: 2,
                order: 3,
              },
              {
                exerciseId: createdExercises[7]._id,
                targetSets: 3,
                targetReps: 12,
                targetRir: 2,
                order: 4,
              },
              {
                exerciseId: createdExercises[8]._id,
                targetSets: 3,
                targetReps: 12,
                targetRir: 2,
                order: 5,
              },
            ],
          },
          {
            name: 'Lower B',
            dayNumber: 4,
            exercises: [
              {
                exerciseId: createdExercises[1]._id,
                targetSets: 3,
                targetReps: 10,
                targetRir: 2,
                order: 1,
              },
              {
                exerciseId: createdExercises[9]._id,
                targetSets: 4,
                targetReps: 10,
                targetRir: 2,
                order: 2,
              },
            ],
          },
        ],
        description: 'Upper/Lower split focused on strength and size',
        difficulty: 'intermediate',
        goals: ['strength', 'hypertrophy'],
      },
    ];

    const createdTemplates = await ProgramTemplate.insertMany(templates);
    console.log(`Created ${createdTemplates.length} program templates`);

    console.log('\n--- Seed Complete ---');
    console.log('Test user credentials:');
    console.log('  Email: test@test.com');
    console.log('  Password: password123');

    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seed();
