const Joi = require('joi');

const SPLIT_TYPE_VALUES = [
  'full body',
  'push pull legs',
  'upper lower',
  'arnold',
  'modified full body',
  'other',
];
const DIFFICULTY_VALUES = ['beginner', 'intermediate', 'advanced'];
const GOAL_VALUES = ['strength', 'hypertrophy', 'endurance'];

// GET /api/v1/programs/templates
const getProgramTemplates = {
  query: Joi.object().keys({
    splitType: Joi.string()
      .valid(...SPLIT_TYPE_VALUES)
      .optional(),
    createdBy: Joi.string().optional(),
    difficulty: Joi.string()
      .valid(...DIFFICULTY_VALUES)
      .optional(),
    daysPerWeek: Joi.number().integer().min(1).max(14).optional(),
  }),
};

// GET /api/v1/programs/templates/:id
const getProgramTemplateById = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

// POST /api/v1/programs/templates
const createProgramTemplate = {
  body: Joi.object().keys({
    name: Joi.string().max(50).trim().required(),
    createdBy: Joi.string().min(2).max(50).trim().required(),
    splitType: Joi.string()
      .valid(...SPLIT_TYPE_VALUES)
      .required(),
    daysPerWeek: Joi.number().integer().min(1).max(14).required(),
    periodization: Joi.object().required(),
    workouts: Joi.array().required(),
    description: Joi.string().max(500).optional(),
    difficulty: Joi.string()
      .valid(...DIFFICULTY_VALUES)
      .required(),
    goals: Joi.array()
      .items(Joi.string().valid(...GOAL_VALUES))
      .max(3)
      .optional(),
    isActive: Joi.boolean().optional(),
  }),
};

// PATCH /api/v1/programs/templates/:id
const updateProgramTemplate = {
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
      workouts: Joi.array().optional(),
      periodization: Joi.object().optional(),
      daysPerWeek: Joi.number().integer().min(1).max(14).optional(),
      splitType: Joi.string()
        .valid(...SPLIT_TYPE_VALUES)
        .optional(),
    })
    .min(1),
};

// DELETE /api/v1/programs/templates/:id
const deleteProgramTemplate = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

module.exports = {
  getProgramTemplates,
  getProgramTemplateById,
  createProgramTemplate,
  updateProgramTemplate,
  deleteProgramTemplate,
};
