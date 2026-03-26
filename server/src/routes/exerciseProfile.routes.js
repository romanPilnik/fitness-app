/*
const express = require("express");
const { verifyToken } = require("../middlewares/auth");
const exerciseProfileController = require("../controllers/exerciseProfile.controller");
const { validate } = require("../middlewares/validate.ts");
const exerciseProfileValidation = require("../validations/exerciseProfile.validation.ts");

const exerciseProfileRouter = express.Router();

exerciseProfileRouter.get(
  "/",
  verifyToken,
  validate(exerciseProfileValidation.getExerciseProfiles),
  exerciseProfileController.getExerciseProfiles,
);

exerciseProfileRouter.get(
  "/:exerciseId",
  verifyToken,
  validate(exerciseProfileValidation.getExerciseProfileById),
  exerciseProfileController.getExerciseProfileById,
);

exerciseProfileRouter.patch(
  "/:exerciseId",
  verifyToken,
  validate(exerciseProfileValidation.updateExerciseProfile),
  exerciseProfileController.updateExerciseProfile,
);

module.exports = exerciseProfileRouter;
*/
