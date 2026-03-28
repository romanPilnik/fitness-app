import type { Request, Response } from "express";
import { sendSuccess } from "../utils/response";
import { ProgramService } from "../services/program/program.service";
import type {
  GetProgramByIdParams,
  CreateFromTemplateBody,
  CreateCustomProgramBody,
  UpdateProgramParams,
  UpdateProgramBody,
  DeleteProgramParams,
  AddProgramWorkoutParams,
  AddProgramWorkoutBody,
  UpdateProgramWorkoutParams,
  UpdateProgramWorkoutBody,
  DeleteProgramWorkoutParams,
  AddWorkoutExerciseParams,
  AddWorkoutExerciseBody,
  UpdateWorkoutExerciseParams,
  UpdateWorkoutExerciseBody,
  DeleteWorkoutExerciseParams,
  BulkReorderWorkoutExercisesParams,
  BulkReorderWorkoutExercisesBody,
  GetProgramsQuery,
} from "../validations/program.validation";
import { AuthenticationError, ERROR_CODES } from "../errors";

async function getPrograms(req: Request, res: Response) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.TOKEN_REQUIRED);
  const query = req.query as unknown as GetProgramsQuery;
  const programs = await ProgramService.getPrograms({
    ...query,
    userId: req.user.id,
  });
  return sendSuccess(res, programs, 200, "Programs retrieved");
}

async function getActiveProgram(req: Request, res: Response) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.TOKEN_REQUIRED);
  const program = await ProgramService.getActiveProgram({
    userId: req.user.id,
  });
  return sendSuccess(res, program, 200, "Active program retrieved");
}

async function getProgramById(
  req: Request<GetProgramByIdParams>,
  res: Response,
) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.TOKEN_REQUIRED);
  const program = await ProgramService.getProgramById({
    programId: req.params.id,
    userId: req.user.id,
  });
  return sendSuccess(res, program, 200, "Program retrieved");
}

async function createFromTemplate(
  req: Request<object, object, CreateFromTemplateBody>,
  res: Response,
) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.TOKEN_REQUIRED);
  const { templateId, name, startDate } = req.body;
  const program = await ProgramService.createFromTemplate({
    userId: req.user.id,
    templateId,
    name,
    startDate,
  });
  return sendSuccess(res, program, 201, "Program created from template");
}

async function createCustomProgram(
  req: Request<object, object, CreateCustomProgramBody>,
  res: Response,
) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.TOKEN_REQUIRED);
  const program = await ProgramService.createCustomProgram({
    userId: req.user.id,
    ...req.body,
  });
  return sendSuccess(res, program, 201, "Custom program created");
}

async function updateProgram(
  req: Request<UpdateProgramParams, object, UpdateProgramBody>,
  res: Response,
) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.TOKEN_REQUIRED);
  const program = await ProgramService.updateProgram({
    programId: req.params.id,
    userId: req.user.id,
    ...req.body,
  });
  return sendSuccess(res, program, 200, "Program updated");
}

async function deleteProgram(req: Request<DeleteProgramParams>, res: Response) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.TOKEN_REQUIRED);
  await ProgramService.deleteProgram({
    programId: req.params.id,
    userId: req.user.id,
  });
  return sendSuccess(res, null, 204);
}

async function addProgramWorkout(
  req: Request<AddProgramWorkoutParams, object, AddProgramWorkoutBody>,
  res: Response,
) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.TOKEN_REQUIRED);
  const { name, dayNumber } = req.body;
  const workout = await ProgramService.addProgramWorkout({
    programId: req.params.id,
    userId: req.user.id,
    name,
    dayNumber,
  });
  return sendSuccess(res, workout, 201, "Workout added to program");
}

async function updateProgramWorkout(
  req: Request<UpdateProgramWorkoutParams, object, UpdateProgramWorkoutBody>,
  res: Response,
) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.TOKEN_REQUIRED);
  const { name, dayNumber } = req.body;
  const workout = await ProgramService.updateProgramWorkout({
    programId: req.params.id,
    workoutId: req.params.workoutId,
    userId: req.user.id,
    name,
    dayNumber,
  });
  return sendSuccess(res, workout, 200, "Program workout updated");
}

async function deleteProgramWorkout(
  req: Request<DeleteProgramWorkoutParams>,
  res: Response,
) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.TOKEN_REQUIRED);
  await ProgramService.deleteProgramWorkout({
    programId: req.params.id,
    workoutId: req.params.workoutId,
    userId: req.user.id,
  });
  return sendSuccess(res, null, 204);
}

async function addWorkoutExercise(
  req: Request<AddWorkoutExerciseParams, object, AddWorkoutExerciseBody>,
  res: Response,
) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.TOKEN_REQUIRED);
  const {
    exerciseId,
    order,
    targetSets,
    targetWeight,
    targetTotalReps,
    targetTopSetReps,
    targetRir,
  } = req.body;
  const workoutExercise = await ProgramService.addWorkoutExercise({
    programId: req.params.id,
    workoutId: req.params.workoutId,
    userId: req.user.id,
    exerciseId,
    order,
    targetSets,
    targetWeight,
    targetTotalReps,
    targetTopSetReps,
    targetRir,
  });
  return sendSuccess(res, workoutExercise, 201, "Exercise added to workout");
}

async function updateWorkoutExercise(
  req: Request<UpdateWorkoutExerciseParams, object, UpdateWorkoutExerciseBody>,
  res: Response,
) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.TOKEN_REQUIRED);
  const workoutExercise = await ProgramService.updateWorkoutExercise({
    programId: req.params.id,
    workoutId: req.params.workoutId,
    workoutExerciseId: req.params.exerciseId,
    userId: req.user.id,
    ...req.body,
  });
  return sendSuccess(res, workoutExercise, 200, "Workout exercise updated");
}

async function deleteWorkoutExercise(
  req: Request<DeleteWorkoutExerciseParams>,
  res: Response,
) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.TOKEN_REQUIRED);
  await ProgramService.deleteWorkoutExercise({
    programId: req.params.id,
    workoutId: req.params.workoutId,
    workoutExerciseId: req.params.exerciseId,
    userId: req.user.id,
  });
  return sendSuccess(res, null, 204);
}

async function bulkReorderWorkoutExercises(
  req: Request<
    BulkReorderWorkoutExercisesParams,
    object,
    BulkReorderWorkoutExercisesBody
  >,
  res: Response,
) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.TOKEN_REQUIRED);
  const result = await ProgramService.bulkReorderWorkoutExercises({
    programId: req.params.id,
    workoutId: req.params.workoutId,
    userId: req.user.id,
    exercises: req.body.exercises,
  });
  return sendSuccess(res, result, 200, "Exercises reordered");
}

export const ProgramController = {
  getPrograms,
  getActiveProgram,
  getProgramById,
  createFromTemplate,
  createCustomProgram,
  updateProgram,
  deleteProgram,
  addProgramWorkout,
  updateProgramWorkout,
  deleteProgramWorkout,
  addWorkoutExercise,
  updateWorkoutExercise,
  deleteWorkoutExercise,
  bulkReorderWorkoutExercises,
};
