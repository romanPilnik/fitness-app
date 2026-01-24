const sessionService = require('../services/session/session.service');
const { sendSuccess } = require('../utils/response');

// GET api/v1/sessions/
const getSessions = async (req, res) => {
  const sessions = await sessionService.getSessions(req.user._id, req.query);
  return sendSuccess(res, sessions, 200, 'Sessions retrieved');
};

// GET api/v1/sessions/:sessionId
const getSessionById = async (req, res) => {
  const session = await sessionService.getSessionById(req.params.sessionId);
  return sendSuccess(res, session, 200, 'Session retrieved');
};

// POST api/v1/sessions/create
const createSession = async (req, res) => {
  const session = await sessionService.createSession(req.user._id, req.body);
  return sendSuccess(res, session, 201, 'Session logged');
};

// DELETE api/v1/sessions/:sessionId
const deleteSession = async (req, res) => {
  await sessionService.deleteSession(req.params.sessionId);
  return sendSuccess(res, null, 204);
};

module.exports = {
  getSessions,
  getSessionById,
  createSession,
  deleteSession,
};
