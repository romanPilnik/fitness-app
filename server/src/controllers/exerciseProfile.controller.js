/*
const exerciseProfileService = require("../services/exerciseProfile/exerciseProfile.service");
const { sendSuccess } = require("../utils/response");

const getExerciseProfiles = async (req, res) => {
  const profiles = await exerciseProfileService.getExerciseProfiles(
    req.user._id,
  );
  return sendSuccess(res, profiles, 200, "Profiles retrieved");
};

const getExerciseProfileById = async (req, res) => {
  const profile = await exerciseProfileService.getExerciseProfileById(
    req.params.exerciseId,
    req.user._id,
  );
  return sendSuccess(res, profile, 200, "Profile retrieved");
};

const updateExerciseProfile = async (req, res) => {
  const profile = await exerciseProfileService.updateExerciseProfile(
    req.params.exerciseId,
    req.user._id,
    req.body,
  );
  return sendSuccess(res, profile, 200, "Profile updated");
};

module.exports = {
  getExerciseProfiles,
  getExerciseProfileById,
  updateExerciseProfile,
};
*/
