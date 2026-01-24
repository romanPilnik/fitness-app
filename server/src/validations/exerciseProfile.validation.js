const Joi = require('joi');

const getExerciseProfiles = {
  query: Joi.object().keys({
    isFavorite: Joi.boolean().optional(),
    needsFormCheck: Joi.boolean().optional(),
    isInjuryModified: Joi.boolean().optional(),
  }),
};

const getExerciseProfileById = {
  params: Joi.object().keys({
    exerciseId: Joi.string().required(),
  }),
};

const updateExerciseProfile = {
  params: Joi.object().keys({
    exerciseId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    isFavorite: Joi.boolean().optional(),
    needsFormCheck: Joi.boolean().optional(),
    isInjuryModified: Joi.boolean().optional(),
    difficultyRating: Joi.number().integer().min(1).max(5).optional(),
    enjoymentRating: Joi.number().integer().min(1).max(5).optional(),
    formNotes: Joi.string().max(500).optional(),
    injuryNotes: Joi.string().max(500).optional(),
  }),
};

module.exports = {
  getExerciseProfiles,
  getExerciseProfileById,
  updateExerciseProfile,
};
