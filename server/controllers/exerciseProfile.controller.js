const exerciseProfileService = require('../exerciseProfile/exerciseProfile.service');
const { sendSuccess } = require('../utils/response');

// GET /api/v1/profile/exercises
const getExerciseProfiles = async (req, res) => {
  const profiles = await exerciseProfileService.getExerciseProfiles(req.user._id);
  return sendSuccess(res, profiles, 200, 'Profiles retrieved');
};

// GET /api/v1/profile/exercises/:exerciseId
const getExerciseProfileById = async (req, res) => {
  const profile = await exerciseProfileService.getExerciseProfileById(
    req.params.exerciseId,
    req.user._id,
  );
  return sendSuccess(res, profile, 200, 'Profile retrieved');
};

// PATCH /api/v1/profile/exercises/:exerciseId
const updateExerciseProfile = async (req, res) => {
  const profile = await exerciseProfileService.updateExerciseProfile(
    req.params.exerciseId,
    req.user._id,
    req.body,
  );
  return sendSuccess(res, profile, 200, 'Profile updated');
};

module.exports = {
  getExerciseProfiles,
  getExerciseProfileById,
  updateExerciseProfile,
};
