const express = require('express');
const { verifyToken } = require('../middlewares/auth');
const exerciseProfileController = require('../controllers/exerciseProfile.controller');
const validate = require('../middlewares/validate');
const exerciseProfileValidation = require('../validations/exerciseProfile.validation');

const exerciseProfileRouter = express.Router();

// GET /api/v1/profile/exercises/
exerciseProfileRouter.get(
  '/',
  verifyToken,
  validate(exerciseProfileValidation.getExerciseProfiles),
  exerciseProfileController.getExerciseProfiles,
);

// GET /api/v1/profile/exercises/:exerciseId
exerciseProfileRouter.get(
  '/:exerciseId',
  verifyToken,
  validate(exerciseProfileValidation.getExerciseProfileById),
  exerciseProfileController.getExerciseProfileById,
);

// PATCH /api/v1/profile/exercises/:exerciseId
exerciseProfileRouter.patch(
  '/:exerciseId',
  verifyToken,
  validate(exerciseProfileValidation.updateExerciseProfile),
  exerciseProfileController.updateExerciseProfile,
);

module.exports = exerciseProfileRouter;
