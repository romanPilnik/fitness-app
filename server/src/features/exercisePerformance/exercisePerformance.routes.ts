import { Router } from "express";
import { ExercisePerformanceController } from "./exercisePerformance.controller";
import { validate } from "@/middlewares/validate.middleware";
import { getExercisePerformanceSchema } from "./exercisePerformance.validation";
import { verifySession } from "@/middlewares/betterAuth.middleware";
import { apiLimiter } from "@/middlewares/rateLimit.middleware";

const exercisePerformanceRouter = Router();

exercisePerformanceRouter.get(
  "/:exerciseId/performance",
  verifySession,
  apiLimiter,
  validate(getExercisePerformanceSchema),
  ExercisePerformanceController.getExercisePerformance,
);

export default exercisePerformanceRouter;
