const ExerciseProfile = require('../../models/UserExerciseProfile');

// GET /api/v1/profile/exercises
const getExerciseProfiles = async (userId, filters = {}, options = {}) => {
  const ALLOWED_FILTERS = ['isFavorite', 'needsFormCheck', 'isInjuryModified'];

  const query = {
    userId,
    'status.isActive': true,
  };

  Object.keys(filters).forEach((key) => {
    if (ALLOWED_FILTERS.includes(key)) {
      query[key] = filters[key];
    }
  });

  const { page, limit, skip } = parsePaginationParams(options);
  const findQuery = ExerciseProfile.find(query)
    .populate('exerciseId', 'name primaryMuscle equipment')
    .select('-__v')
    .skip(skip)
    .limit(limit)
    .lean();

  const countQuery = ExerciseProfile.countDocuments(query);
  const [exerciseProfiles, totalCount] = await Promise.all([findQuery.exec(), countQuery.exec()]);

  const pagination = calculatePagination(totalCount, page, limit);

  return {
    exerciseProfiles,
    totalCount,
    pagination,
  };
};

// GET /api/v1/profile/exercises/:exerciseId
const getExerciseProfileById = async (exerciseId, userId) => {
  const profile = await ExerciseProfile.findOne({
    userId,
    exerciseId,
  }).lean();
  if (!profile) {
    const error = new Error('Exercise profile not found');
    error.statusCode = 404;
    throw error;
  }
  return profile;
};

// PATCH /api/v1/profile/exercises/:exerciseId
const updateExerciseProfile = async (exerciseId, userId, updateData) => {
  const ALLOWED_UPDATES = [
    'isFavorite',
    'needsFormCheck',
    'isInjuryModified',
    'difficultyRating',
    'enjoymentRating',
    'formNotes',
    'injuryNotes',
  ];

  const updates = {};
  Object.keys(updateData).forEach((key) => {
    if (ALLOWED_UPDATES.includes(key)) {
      updates[key] = updateData[key];
    }
  });
  const profile = await ExerciseProfile.findOneAndUpdate(
    { exerciseId, userId },
    { $set: updates },
    { new: true, runValidators: true },
  )
    .select('-__v')
    .lean();

  if (!profile) {
    const error = new Error('Exercise profile not found');
    error.statusCode = 404;
    throw error;
  }

  return profile;
};

const updateFromSession = async (userId, session) => {
  for (const exercise of session.exercises) {
    const profile = await ExerciseProfile.getOrCreateProfile(userId, exercise.exerciseId);

    _updateRecentSessions(profile, exercise, session._id);
    _updateLastPerformed(profile, exercise);
    _updatePersonalRecord(profile, exercise);
    await profile.save();
  }

  // TODO: when algorithm is clear update progression related fields
};

const _updateRecentSessions = (profile, exercise, sessionId) => {
  const topSet = _findTopSet(exercise.sets);

  const sessionSummary = {
    date: Date.now(),
    topSetWeight: topSet.weight,
    topSetReps: topSet.reps,
    totalSets: exercise.sets.length,
    sessionId: sessionId,
  };

  profile.recentSessions.unshift(sessionSummary);
  if (profile.recentSessions.length > 10) {
    profile.recentSessions.pop();
  }
};
const _updateLastPerformed = (profile, exercise) => {
  const topSet = _findTopSet(exercise.sets);

  profile.lastPerformed = {
    date: Date.now(),
    weight: topSet.weight,
    reps: topSet.reps,
    sets: exercise.sets.length,
  };
};
const _updatePersonalRecord = (profile, exercise) => {
  const topSet = _findTopSet(exercise.sets);

  if (
    profile.personalRecord.weight === 0 ||
    topSet.weight > profile.personalRecord.weight ||
    (topSet.weight === profile.personalRecord.weight && topSet.reps > profile.personalRecord.reps)
  )
    profile.personalRecord = {
      date: Date.now(),
      weight: topSet.weight,
      reps: topSet.reps,
    };
};

const _findTopSet = (sets) => {
  let topSet = sets[0];

  for (const set of sets) {
    if (set.weight > topSet.weight || (set.weight === topSet.weight && set.reps > topSet.reps)) {
      topSet = set;
    }
  }

  return topSet;
};

module.exports = {
  getExerciseProfiles,
  getExerciseProfileById,
  updateExerciseProfile,
  updateFromSession,
};
