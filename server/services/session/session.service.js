const WorkoutSession = require('../../models/WorkoutSession');
const ExerciseProfileService = require('../../services/exerciseProfile/exerciseProfile.service');
const UserProgramService = require('../../services/program/userProgram.service');

// GET api/v1/sessions/
const getSessions = async (userId, options = {}) => {
  const query = { userId };

  const paginateOptions = {
    page: parseInt(options.page) || 1,
    limit: parseInt(options.limit) || 20,
    select: '-__v',
    sort: { datePerformed: -1 },
    lean: true,
  };

  return await WorkoutSession.paginate(query, paginateOptions);
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
  await ExerciseProfileService.updateFromSession(userId, session);

  // Call to service to updateProgress
  await UserProgramService.updateProgress(userId, session);

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
