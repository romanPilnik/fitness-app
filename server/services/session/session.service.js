const WorkoutSession = require('../../models/WorkoutSession');
const { parsePaginationParams, calculatePagination } = require('../../utils/pagination');

// GET api/v1/sessions/
const getSessions = async (userId, options = {}) => {
  const { page, limit, skip } = parsePaginationParams(options || {});
  const sessions = await WorkoutSession.find({ userId })
    .select('-__v')
    .skip(skip)
    .limit(limit)
    .sort({ datePerformed: -1 })
    .lean();
  const count = await WorkoutSession.countDocuments({ userId });

  return {
    sessions,
    count,
    pagination: calculatePagination(page, limit, count),
  };
};

// GET api/v1/sessions/:sessionId
const getSessionById = async (sessionId) => {
  const session = await WorkoutSession.findById(sessionId).select('-__v');
  if (!session) {
    const error = new Error('Session not found');
    error.statusCode = 404;
    throw error;
  }
  return session;
};

// === WILL BE ADDED LATER ===
// PATCH api/v1/sessions/:sessionId
// const updateSession = async (sessionId, updatedFields) => {};

// DELETE api/v1/sessions/:sessionId
const deleteSession = async (sessionId) => {
  const session = await WorkoutSession.findByIdAndUpdate(
    sessionId,
    { $set: { isActive: false } },
    { new: true },
  );
  if (!session) {
    const error = new Error('Session not found');
    error.statusCode = 404;
    throw error;
  }
};

module.exports = {
  getSessions,
  getSessionById,
  deleteSession,
};
