import { AuthenticationError } from "@/errors/index";
import { ERROR_CODES } from "@/types/error.types";
import { sendSuccess } from "@/utils/response";
import type { Request, Response } from "express";
import { getExercisePerformanceSummary } from "./exercisePerformance.service";
import type { GetExercisePerformanceParams } from "./exercisePerformance.validation";

async function getExercisePerformance(
  req: Request<GetExercisePerformanceParams>,
  res: Response,
) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.UNAUTHENTICATED);
  const summary = await getExercisePerformanceSummary({
    userId: req.user.id,
    exerciseId: req.params.exerciseId,
  });
  return sendSuccess(res, summary, 200, "Exercise performance retrieved");
}

export const ExercisePerformanceController = {
  getExercisePerformance,
};
