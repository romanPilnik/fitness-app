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

module.exports = {
  getExerciseProfiles,
  getExerciseProfileById,
  updateExerciseProfile,
};
