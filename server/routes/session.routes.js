const express = require('express');
const { verifyToken } = require('../middleware/auth');
const sessionController = require('../controllers/session.controller');
const validate = require('../middlewares/validate');
const sessionValidation = require('../validations/session.validation');

const sessionRouter = express.Router();

// GET api/v1/sessions/
sessionRouter.get('/', verifyToken, sessionController.getSessions);

// GET api/v1/sessions/:sessionId
sessionRouter.get(
  '/:sessionId',
  verifyToken,
  validate(sessionValidation.getSessionById),
  sessionController.getSessionById,
);

// POST api/v1/sessions/create
sessionRouter.post(
  '/create',
  verifyToken,
  validate(sessionValidation.createSession),
  sessionController.createSession,
);

// DELETE api/v1/sessions/:sessionId
sessionRouter.delete(
  '/:sessionId',
  verifyToken,
  validate(sessionValidation.deleteSession),
  sessionController.deleteSession,
);

module.exports = sessionRouter;
