import { ExerciseStatsModel } from '../../models/ExerciseStats.model.js';
import { Types, type PaginateResult } from 'mongoose';
import type {
  GetExerciseStatsListInputDTO,
  GetExerciseStatsByIdInputDTO,
  UpdateExerciseStatsInputDTO,
  ExerciseStatsDTO,
  UpdateFromSessionInputDTO,
} from './exerciseStats.dto.js';
import type { SetDTO } from '../session/session.dto.js';
import { mapPaginatedExerciseStats, toExerciseStatsDTO } from './exerciseStats.mapper.js';
import { AppError } from '../../errors/AppError.js';
import { ERROR_CODES } from '../../types/error.types.js';

// Add better filtering, sorting by exercise fields
async function getExerciseStatsList(
  input: GetExerciseStatsListInputDTO,
): Promise<PaginateResult<ExerciseStatsDTO>> {
  const { userId, filters = {}, pagination = {} } = input;

  const queryOptions: Record<string, unknown> = {
    userId,
    isActive: true,
  };

  if (filters.isFavorite !== undefined) queryOptions.isFavorite = filters.isFavorite;

  const paginationOptions = {
    page: pagination.page || 1,
    limit: pagination.limit || 20,
    select: '-__v',
    populate: { path: 'exerciseId', select: 'name primaryMuscle equipment' },
    lean: true,
  };

  const result = await ExerciseStatsModel.paginate(queryOptions, paginationOptions);
  return mapPaginatedExerciseStats(
    result as unknown as Parameters<typeof mapPaginatedExerciseStats>[0],
  );
}

async function getExerciseStatsById(input: GetExerciseStatsByIdInputDTO): Promise<ExerciseStatsDTO> {
  const { exerciseId, userId } = input;
  const stats = await ExerciseStatsModel.findOne({
    userId,
    exerciseId,
  }).populate('exerciseId', 'name primaryMuscle equipment').lean();
  if (!stats) {
    throw new AppError('Exercise stats not found', 404, ERROR_CODES.NOT_FOUND);
  }
  return toExerciseStatsDTO(stats as unknown as Parameters<typeof toExerciseStatsDTO>[0]);
}

async function updateExerciseStats(input: UpdateExerciseStatsInputDTO): Promise<ExerciseStatsDTO> {
  const { exerciseId, userId, updates } = input;
  const ALLOWED_UPDATES = [
    'isFavorite',
    'needsFormCheck',
    'isInjuryModified',
    'difficultyRating',
    'enjoymentRating',
    'formNotes',
    'injuryNotes',
  ];

  const sanitizedUpdates: Record<string, unknown> = {};
  Object.keys(updates).forEach((key) => {
    if (ALLOWED_UPDATES.includes(key)) {
      sanitizedUpdates[key] = updates[key as keyof typeof updates];
    }
  });
  const stats = await ExerciseStatsModel.findOneAndUpdate(
    { exerciseId, userId },
    { $set: sanitizedUpdates },
    { new: true, runValidators: true },
  )
    .select('-__v')
    .populate('exerciseId', 'name primaryMuscle equipment')
    .lean();

  if (!stats) {
    throw new AppError('Exercise stats not found', 404, ERROR_CODES.NOT_FOUND);
  }

  return toExerciseStatsDTO(stats as unknown as Parameters<typeof toExerciseStatsDTO>[0]);
}

async function updateFromSession(input: UpdateFromSessionInputDTO): Promise<void> {
  const { userId, session } = input;

  for (const exercise of session.exercises) {
    const stats = await ExerciseStatsModel.getOrCreateProfile(userId, exercise.exerciseId);
    const topSet = findTopSet(exercise.sets);

    stats
      .addSessionToHistory({
        date: new Date(),
        topSetWeight: topSet.weight,
        topSetReps: topSet.reps,
        totalSets: exercise.sets.length,
        sessionId: new Types.ObjectId(session.id),
      })
      .updateLastPerformed({
        weight: topSet.weight,
        reps: topSet.reps,
        sets: exercise.sets.length,
      })
      .updatePersonalRecord({
        weight: topSet.weight,
        reps: topSet.reps,
      });

    await stats.save();
  }
}

function findTopSet(sets: SetDTO[]): SetDTO {
  let topSet = sets[0];

  for (const set of sets) {
    if (set.weight > topSet.weight || (set.weight === topSet.weight && set.reps > topSet.reps)) {
      topSet = set;
    }
  }

  return topSet;
}

export const ExerciseStatsService = {
  getExerciseStatsList,
  getExerciseStatsById,
  updateExerciseStats,
  updateFromSession,
};