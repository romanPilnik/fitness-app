import { ExerciseService } from "../services/exercise/exercise.service";
import { sendSuccess } from "../utils/response";
import { AuthenticationError } from "../errors/index";
import { ERROR_CODES } from "../types/error.types";
import type { Request, Response } from "express";
import type {
  CreateExerciseBody,
  DeleteExerciseParams,
  GetExerciseByIdParams,
  GetExercisesQuery,
  UpdateExerciseBody,
  UpdateExerciseParams,
} from "../validations/exercise.validation";

async function getExercises(req: Request, res: Response) {
  const query = req.query as unknown as GetExercisesQuery;
  const result = await ExerciseService.getExercises({
    ...query,
    userId: req.user?.id,
  });
  return sendSuccess(res, result, 200, "Exercises retrieved successfully");
}

async function getExerciseById(
  req: Request<GetExerciseByIdParams>,
  res: Response,
) {
  const { id } = req.params;
  const exercise = await ExerciseService.getExerciseById({ id });
  return sendSuccess(res, exercise, 200, "Exercise retrieved successfully");
}

async function createExercise(
  req: Request<object, object, CreateExerciseBody>,
  res: Response,
) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.TOKEN_REQUIRED);
  const createdByUserId = req.user.role === "admin" ? null : req.user.id;
  const newExercise = await ExerciseService.createExercise({
    ...req.body,
    createdByUserId,
  });
  return sendSuccess(res, newExercise, 201, "Exercise created successfully");
}

async function updateExercise(
  req: Request<UpdateExerciseParams, object, UpdateExerciseBody>,
  res: Response,
) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.TOKEN_REQUIRED);
  const { id } = req.params;
  const { body } = req;
  const exercise = await ExerciseService.updateExercise({
    id,
    userId: req.user.id,
    ...body,
  });
  return sendSuccess(res, exercise, 200, "Exercise updated successfully");
}

async function deleteExercise(
  req: Request<DeleteExerciseParams>,
  res: Response,
) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.TOKEN_REQUIRED);

  const { id } = req.params;
  await ExerciseService.deleteExercise({ id, userId: req.user.id });
  return sendSuccess(res, null, 204);
}

export const ExerciseController = {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
};
