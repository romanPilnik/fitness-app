const express = require('express');
const { verifyToken } = require('../middleware/auth');
const sessionController = require('../controllers/session.controller');

const sessionRouter = express.Router();

// GET api/v1/sessions/
sessionRouter.get('/', verifyToken, sessionController.getSessions);

// GET api/v1/sessions/:sessionId
sessionRouter.get('/:sessionId', verifyToken, sessionController.getSessionById);

// POST api/v1/sessions/create
sessionRouter.post('/create', verifyToken, sessionController.createSession);

// DELETE api/v1/sessions/:sessionId
sessionRouter.delete('/:sessionId', verifyToken, sessionController.deleteSession);

module.exports = sessionRouter;
