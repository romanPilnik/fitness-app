import { Router } from "express";
import { verifySession } from "@/middlewares/betterAuth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { WorkoutGenerationController } from "./workoutGeneration.controller.js";
import { batchGeneratedTargetsSchema } from "./workoutGeneration.validation.js";

const generatedTargetsRouter = Router();

generatedTargetsRouter.post(
  "/batch",
  verifySession,
  validate(batchGeneratedTargetsSchema),
  WorkoutGenerationController.getGeneratedTargetsBatch,
);

generatedTargetsRouter.get(
  "/:programWorkoutId",
  verifySession,
  WorkoutGenerationController.getGeneratedTargets,
);

export default generatedTargetsRouter;
