import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/authorize.middleware";
import { ExerciseController } from "../controllers/exercise.controller";
import { validate } from "../middlewares/validate";
import {
  getExercises,
  getExerciseById,
  createExercise,
  deleteExercise,
} from "../validations/exercise.validation";

const exerciseRouter = Router();

exerciseRouter.get(
  "/",
  validate(getExercises),
  ExerciseController.getExercises,
);

exerciseRouter.get(
  "/:id",
  validate(getExerciseById),
  ExerciseController.getExerciseById,
);

exerciseRouter.post(
  "/",
  verifyToken,
  requireRole("admin"),
  validate(createExercise),
  ExerciseController.createExercise,
);

exerciseRouter.patch(
  "/:id",
  verifyToken,
  requireRole("admin"),
  validate(getExercises),
  ExerciseController.updateExercise,
);

exerciseRouter.delete(
  "/:id",
  verifyToken,
  requireRole("admin"),
  validate(deleteExercise),
  ExerciseController.deleteExercise,
);

module.exports = exerciseRouter;
