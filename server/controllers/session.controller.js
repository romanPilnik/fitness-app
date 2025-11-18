const sessionService = require('../services/session/session.service');
const { sendSuccess } = require('../utils/response');

// GET api/v1/sessions/
const getSessions = async (req, res) => {};

// POST api/v1/sessions/
const createSession = async (req, res) => {};

// GET api/v1/sessions/:sessionId
const getSessionById = async (req, res) => {};

// PATCH api/v1/sessions/:sessionId
const updateSession = async (req, res) => {};

// DELETE api/v1/sessions/:sessionId
const deleteSession = async (req, res) => {};

module.exports = {
  getSessions,
  createSession,
  getSessionById,
  updateSession,
  deleteSession,
};
