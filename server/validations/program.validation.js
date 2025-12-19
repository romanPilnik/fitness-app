const Joi = require('joi');

const CREATED_FROM_VALUES = ['template', 'scratch', 'shared'];
const DIFFICULTY_VALUES = ['beginner', 'intermediate', 'advanced'];
const GOAL_VALUES = ['strength', 'hypertrophy', 'endurance'];
const SPLIT_TYPE_VALUES = [
  'full body',
  'push pull legs',
  'upper lower',
  'arnold',
  'modified full body',
  'other',
];
const STATUS_VALUES = ['active', 'paused', 'completed'];

// GET /api/v1/programs
const getPrograms = {
  query: Joi.object().keys({
    status: Joi.string()
      .valid(...STATUS_VALUES)
      .optional(),
  }),
};

// GET /api/v1/programs/active - No validation needed
const getActiveProgram = {};

// GET /api/v1/programs/:id
const getProgramById = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

// POST /api/v1/programs/from-template
const createFromTemplate = {
  body: Joi.object().keys({
    templateId: Joi.string().required(),
    startDate: Joi.date().iso().optional(),
    customizations: Joi.object()
      .keys({
        name: Joi.string().max(50).trim().optional(),
        workouts: Joi.object().optional(),
      })
      .optional(),
  }),
};

// POST /api/v1/programs/custom
const createCustomProgram = {
  body: Joi.object().keys({
    name: Joi.string().max(50).trim().required(),
    description: Joi.string().max(500).optional(),
    difficulty: Joi.string()
      .valid(...DIFFICULTY_VALUES)
      .required(),
    goals: Joi.array()
      .items(Joi.string().valid(...GOAL_VALUES))
      .max(3)
      .optional(),
    splitType: Joi.string()
      .valid(...SPLIT_TYPE_VALUES)
      .required(),
    daysPerWeek: Joi.number().integer().min(1).max(14).required(),
    workouts: Joi.array().required(),
    periodization: Joi.object().required(),
    startDate: Joi.date().iso().optional(),
    createdFrom: Joi.string()
      .valid(...CREATED_FROM_VALUES)
      .optional(),
  }),
};

// PATCH /api/v1/programs/:id
const updateProgramById = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().max(50).trim().optional(),
      description: Joi.string().max(500).optional(),
      difficulty: Joi.string()
        .valid(...DIFFICULTY_VALUES)
        .optional(),
      goals: Joi.array()
        .items(Joi.string().valid(...GOAL_VALUES))
        .max(3)
        .optional(),
      splitType: Joi.string()
        .valid(...SPLIT_TYPE_VALUES)
        .optional(),
      daysPerWeek: Joi.number().integer().min(1).max(14).optional(),
      workouts: Joi.array().optional(),
      periodization: Joi.object().optional(),
      status: Joi.string()
        .valid(...STATUS_VALUES)
        .optional(),
      startDate: Joi.date().iso().optional(),
      currentWeek: Joi.number().integer().min(1).optional(),
      nextWorkoutIndex: Joi.number().integer().min(0).optional(),
    })
    .min(1),
};

// DELETE /api/v1/programs/:id
const deleteProgramById = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

module.exports = {
  getPrograms,
  getActiveProgram,
  getProgramById,
  createFromTemplate,
  createCustomProgram,
  updateProgramById,
  deleteProgramById,
};
