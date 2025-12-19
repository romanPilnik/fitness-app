const Joi = require('joi');

const SESSION_STATUS_VALUES = ['completed', 'partially', 'skipped'];

// GET /api/v1/sessions/ - Not needed
const getSessions = {};

// GET /api/v1/sessions/:sessionId
const getSessionById = {
  params: Joi.object().keys({
    sessionId: Joi.string().required(),
  }),
};

// POST /api/v1/sessions/create
const createSession = {
  body: Joi.object().keys({
    programId: Joi.string().required(),
    workoutName: Joi.string().max(35).trim().required(),
    dayNumber: Joi.number().integer().min(1).optional(),
    sessionStatus: Joi.string()
      .valid(...SESSION_STATUS_VALUES)
      .required(),
    exercises: Joi.array().required(),
    sessionDuration: Joi.number().integer().min(0).max(600).optional(),
    notes: Joi.string().max(999).optional(),
  }),
};

// DELETE /api/v1/sessions/:sessionId
const deleteSession = {
  params: Joi.object().keys({
    sessionId: Joi.string().required(),
  }),
};

module.exports = {
  getSessions,
  getSessionById,
  createSession,
  deleteSession,
};
