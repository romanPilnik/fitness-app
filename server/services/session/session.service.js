const WorkoutSession = require('../../models/WorkoutSession');
const UserExerciseProfile = require('../../models/UserExerciseProfile');
const UserProgram = require('../../models/UserProgram');
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

// POST api/v1/sessions/create
const createSession = async (userId, sessionData) => {
  const { programId, workoutName, dayNumber, sessionStatus, exercises, sessionDuration, notes } =
    sessionData;
  // Call to DB to log workout
  const session = await WorkoutSession.create({
    userId,
    programId,
    workoutName,
    dayNumber,
    sessionStatus,
    exercises,
    sessionDuration,
    notes,
    datePerformed: Date.now(),
  });

  // Call service to update exerciseProfiles
  await UserExerciseProfile.updateFromSession(userId, session);

  // Call to service to updateProgress
  await UserProgram.updateProgress(userId);
  // Later on, call to progression service to generate next workout

  return session;
};

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
  createSession,
  deleteSession,
};
