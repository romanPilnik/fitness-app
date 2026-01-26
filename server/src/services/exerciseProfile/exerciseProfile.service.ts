import { ExerciseProfileModel } from '../../models/ExerciseProfile.model.js';
import { Types, type PaginateResult } from 'mongoose';
import type {
  GetExerciseProfilesInputDTO,
  GetExerciseProfileByIdInputDTO,
  UpdateExerciseProfileInputDTO,
  ExerciseProfileDTO,
  updateFromSessionInputDTO,
} from './exerciseProfile.dto.js';
import type { SetDTO } from '../session/session.dto.js';
import { mapPaginatedExerciseProfiles, toExerciseProfileDTO } from './exerciseProfile.mapper.js';
import { AppError } from '../../errors/AppError.js';
import { ERROR_CODES } from '../../types/error.types.js';

// Add better filtering, sorting by exercise fields
async function getExerciseProfiles(
  input: GetExerciseProfilesInputDTO,
): Promise<PaginateResult<ExerciseProfileDTO>> {
  const { userId, filters = {}, pagination = {} } = input;

  const queryOptions: Record<string, unknown> = {
    userId,
    isActive: true,
  };

  if (filters.isFavorite !== undefined) queryOptions.isFavorite = filters.isFavorite;
  if (filters.needsFormCheck !== undefined) queryOptions.needsFormCheck = filters.needsFormCheck;
  if (filters.isInjuryModified !== undefined) queryOptions.isInjuryModified = filters.isInjuryModified;

  const paginationOptions = {
    page: pagination.page || 1,
    limit: pagination.limit || 20,
    select: '-__v',
    populate: { path: 'exerciseId', select: 'name primaryMuscle equipment' },
    lean: true,
  };

  const result = await ExerciseProfileModel.paginate(queryOptions, paginationOptions);
  // Cast needed: paginate + populate + lean doesn't preserve populated types
  return mapPaginatedExerciseProfiles(
    result as unknown as Parameters<typeof mapPaginatedExerciseProfiles>[0],
  );
}

// GET /api/v1/profile/exercises/:exerciseId
async function getExerciseProfileById(input: GetExerciseProfileByIdInputDTO): Promise<ExerciseProfileDTO> {
  const { exerciseId, userId } = input;
  const profile = await ExerciseProfileModel.findOne({
    userId,
    exerciseId,
  }).lean();
  if (!profile) {
    throw new AppError('Exercise profile not found', 404, ERROR_CODES.NOT_FOUND);
  }
  return toExerciseProfileDTO(profile);
};

// PATCH /api/v1/profile/exercises/:exerciseId
async function updateExerciseProfile(input: UpdateExerciseProfileInputDTO): Promise<ExerciseProfileDTO> {

 

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
 
  const sanitizedUpdates : Record<string, unknown> = {};
  Object.keys(updates).forEach((key) => {
    if (ALLOWED_UPDATES.includes(key)) {
      sanitizedUpdates[key] = updates[key as keyof typeof updates];
    }
  });
  const profile = await ExerciseProfileModel.findOneAndUpdate(
    { exerciseId, userId },
    { $set: sanitizedUpdates },
    { new: true, runValidators: true },
  )
    .select('-__v')
    .lean();

  if (!profile) {
    throw new AppError('Exercise profile not found', 404, ERROR_CODES.NOT_FOUND);
  }

  return toExerciseProfileDTO(profile);
};

async function updateFromSession(input: updateFromSessionInputDTO): Promise<void> {
  const { userId, session } = input;

  for (const exercise of session.exercises) {
    const profile = await ExerciseProfileModel.getOrCreateProfile(userId, exercise.exerciseId);
    const topSet = findTopSet(exercise.sets);

    profile
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

    await profile.save();
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

export const ExerciseProfileService = {
  getExerciseProfiles,
  getExerciseProfileById,
  updateExerciseProfile,
  updateFromSession,
};
