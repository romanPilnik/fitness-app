import type { Request, Response } from "express";
import { sendSuccess } from "@/utils/response";
import { ProgramService } from "./program.service";
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
} from "./program.validation";
import { AuthenticationError, ERROR_CODES } from "@/errors";

async function getPrograms(req: Request, res: Response) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.UNAUTHENTICATED);
  const query = req.query as unknown as GetProgramsQuery;
  const programs = await ProgramService.getPrograms({
    ...query,
    userId: req.user.id,
  });
  return sendSuccess(res, programs, 200, "Programs retrieved");
}

async function getActiveProgram(req: Request, res: Response) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.UNAUTHENTICATED);
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
    throw new AuthenticationError("Unauthorized", ERROR_CODES.UNAUTHENTICATED);
  const program = await ProgramService.getProgramById({
    programId: req.params.id,
    userId: req.user.id,
  });
  return sendSuccess(res, program, 200, "Program retrieved");
}

async function getProgramOccurrences(
  req: Request<{ id: string }, unknown, unknown, { dateFrom?: string; dateTo?: string }>,
  res: Response,
) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.UNAUTHENTICATED);
  const rows = await ProgramService.getProgramOccurrences({
    programId: req.params.id,
    userId: req.user.id,
    dateFrom: req.query.dateFrom,
    dateTo: req.query.dateTo,
  });
  return sendSuccess(res, rows, 200, "Occurrences retrieved");
}

async function getNextWorkout(
  req: Request<{ id: string }, unknown, unknown, { timeZone?: string }>,
  res: Response,
) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.UNAUTHENTICATED);
  const tz = req.query.timeZone?.trim();
  const row = await ProgramService.getNextWorkout({
    programId: req.params.id,
    userId: req.user.id,
    timeZone: tz != null && tz.length > 0 ? tz : "UTC",
  });
  return sendSuccess(res, row, 200, "Next workout retrieved");
}

async function patchOccurrence(
  req: Request<{ id: string; occurrenceId: string }>,
  res: Response,
) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.UNAUTHENTICATED);
  const { scheduledOn, status } = req.body as {
    scheduledOn?: string;
    status?: "planned" | "skipped" | "cancelled";
  };
  const row = await ProgramService.patchOccurrence({
    programId: req.params.id,
    occurrenceId: req.params.occurrenceId,
    userId: req.user.id,
    timeZone: "UTC",
    scheduledOn,
    status,
  });
  return sendSuccess(res, row, 200, "Occurrence updated");
}

async function createFromTemplate(
  req: Request<object, object, CreateFromTemplateBody>,
  res: Response,
) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.UNAUTHENTICATED);
  const { templateId, name, startDate, lengthWeeks, timeZone } = req.body;
  const program = await ProgramService.createFromTemplate({
    userId: req.user.id,
    templateId,
    name,
    startDate,
    lengthWeeks,
    timeZone,
  });
  return sendSuccess(res, program, 201, "Program created from template");
}

async function createCustomProgram(
  req: Request<object, object, CreateCustomProgramBody>,
  res: Response,
) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.UNAUTHENTICATED);
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
    throw new AuthenticationError("Unauthorized", ERROR_CODES.UNAUTHENTICATED);
  const program = await ProgramService.updateProgram({
    programId: req.params.id,
    userId: req.user.id,
    ...req.body,
  });
  return sendSuccess(res, program, 200, "Program updated");
}

async function deleteProgram(req: Request<DeleteProgramParams>, res: Response) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.UNAUTHENTICATED);
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
    throw new AuthenticationError("Unauthorized", ERROR_CODES.UNAUTHENTICATED);
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
    throw new AuthenticationError("Unauthorized", ERROR_CODES.UNAUTHENTICATED);
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
    throw new AuthenticationError("Unauthorized", ERROR_CODES.UNAUTHENTICATED);
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
    throw new AuthenticationError("Unauthorized", ERROR_CODES.UNAUTHENTICATED);
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
    throw new AuthenticationError("Unauthorized", ERROR_CODES.UNAUTHENTICATED);
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
    throw new AuthenticationError("Unauthorized", ERROR_CODES.UNAUTHENTICATED);
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
    throw new AuthenticationError("Unauthorized", ERROR_CODES.UNAUTHENTICATED);
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
  getProgramOccurrences,
  getNextWorkout,
  patchOccurrence,
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
