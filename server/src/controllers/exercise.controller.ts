import { ExerciseService } from '../services/exercise/exercise.service';
import { RequestWithQuery } from '../types/express.types';
import { sendSuccess } from '../utils/response';
import { GetExercisesInput } from '../validations/exercise.validation';

type GetExercisesQuery = GetExercisesInput['query'];
type ExerciseFilters = {
  primaryMuscle?: string;
  equipment?: string;
  category?: string;
  movementPattern?: string;
};

async function getExercises(req: RequestWithQuery<GetExercisesQuery>, res: Response){
  const filters: ExerciseFilters = {};
  if (req.query.primaryMuscle && req.query.primaryMuscle!== undefined) {
    filters.primaryMuscle = req.query.primaryMuscle;
  }
  if (req.query.equipment) {
    filters.equipment = req.query.equipment;
  }
  if (req.query.category) {
    filters.category = req.query.category;
  }
  if (req.query.movementPattern) {
    filters.movementPattern = req.query.movementPattern;
  }

  const result = await ExerciseService.getExercises({ filters, req.query });
  return sendSuccess(res, result, 200, 'Exercises retrieved successfully');
};

const getExerciseById = async (req, res) => {
  const exercise = await ExerciseService.getExerciseById(req.params.id);

  return sendSuccess(res, exercise, 200, 'Exercise retrieved successfully');
};

const createExercise = async (req, res) => {
  const newExercise = await ExerciseService.createExercise(req.body);

  return sendSuccess(res, newExercise, 201, 'Exercise created successfully');
};

const updateExercise = async (req, res) => {
  const updatedExercise = await ExerciseService.updateExercise(req.params.id, req.body);

  return sendSuccess(res, updatedExercise, 200, 'Exercise updated successfully');
};

const deleteExercise = async (req, res) => {
  await ExerciseService.deleteExercise(req.params.id);

  return sendSuccess(res, null, 204);
};

export const ExerciseController = {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
};
