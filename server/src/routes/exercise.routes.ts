import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/authorize.middleware";
import { ExerciseController } from "../controllers/exercise.controller";
import { validate } from "../middlewares/validate";
import {
  getExercisesSchema,
  getExerciseByIdSchema,
  createExerciseSchema,
  deleteExerciseSchema,
  updateExerciseSchema,
} from "../validations/exercise.validation";

const exerciseRouter = Router();

exerciseRouter.get(
  "/",
  validate(getExercisesSchema),
  ExerciseController.getExercises,
);

exerciseRouter.get(
  "/:id",
  validate(getExerciseByIdSchema),
  ExerciseController.getExerciseById,
);

exerciseRouter.post(
  "/",
  verifyToken,
  requireRole("admin"),
  validate(createExerciseSchema),
  ExerciseController.createExercise,
);

exerciseRouter.patch(
  "/:id",
  verifyToken,
  validate(updateExerciseSchema),
  ExerciseController.updateExercise,
);

exerciseRouter.delete(
  "/:id",
  verifyToken,
  requireRole("admin"),
  validate(deleteExerciseSchema),
  ExerciseController.deleteExercise,
);

export default exerciseRouter;
