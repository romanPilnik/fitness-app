const Joi = require('joi');
const { MUSCLE_GROUPS, MOVEMENT_PATTERNS } = require('../models/Exercise');

const EQUIPMENT_TYPES = [
  'barbell',
  'dumbbell',
  'cable',
  'machine',
  'bodyweight',
  'bands',
  'kettlebell',
  'none',
];
const CATEGORIES = ['compound', 'isolation'];

const getExercises = {
  query: Joi.object().keys({
    primaryMuscle: Joi.string()
      .valid(...MUSCLE_GROUPS)
      .optional(),
    equipment: Joi.string()
      .valid(...EQUIPMENT_TYPES)
      .optional(),
    category: Joi.string()
      .valid(...CATEGORIES)
      .optional(),
  }),
};

const getExerciseById = {
  params: Joi.object().keys({
    exerciseId: Joi.string().required(),
  }),
};

const createExercise = {
  body: Joi.object().keys({
    name: Joi.string().required().max(50),
    equipment: Joi.string()
      .valid(...EQUIPMENT_TYPES)
      .required(),
    primaryMuscle: Joi.string()
      .valid(...MUSCLE_GROUPS)
      .required(),
    secondaryMuscles: Joi.array()
      .items(Joi.string().valid(...MUSCLE_GROUPS))
      .max(3)
      .optional(),
    category: Joi.string()
      .valid(...CATEGORIES)
      .required(),
    movementPattern: Joi.string()
      .valid(...MOVEMENT_PATTERNS)
      .required(),
    typicalRepRange: Joi.object()
      .keys({
        min: Joi.number().min(1).max(50).optional(),
        max: Joi.number().min(1).max(50).optional(),
      })
      .optional(),
    rirBoundaries: Joi.object()
      .keys({
        min: Joi.number().min(0).max(10).optional(),
        max: Joi.number().min(0).max(10).optional(),
      })
      .optional(),
    instructions: Joi.string().max(500).optional(),
  }),
};

const updateExercise = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string().max(50).optional(),
    equipment: Joi.string()
      .valid(...EQUIPMENT_TYPES)
      .optional(),
    primaryMuscle: Joi.string()
      .valid(...MUSCLE_GROUPS)
      .optional(),
    secondaryMuscles: Joi.array()
      .items(Joi.string().valid(...MUSCLE_GROUPS))
      .max(3)
      .optional(),
    category: Joi.string()
      .valid(...CATEGORIES)
      .optional(),
    movementPattern: Joi.string()
      .valid(...MOVEMENT_PATTERNS)
      .optional(),
    typicalRepRange: Joi.object()
      .keys({
        min: Joi.number().min(1).max(50).optional(),
        max: Joi.number().min(1).max(50).optional(),
      })
      .optional(),
    rirBoundaries: Joi.object()
      .keys({
        min: Joi.number().min(0).max(10).optional(),
        max: Joi.number().min(0).max(10).optional(),
      })
      .optional(),
    instructions: Joi.string().max(500).optional(),
  }),
};

const deleteExercise = {
  params: Joi.object().keys({
    exerciseId: Joi.string().required(),
  }),
};

module.exports = {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
};
