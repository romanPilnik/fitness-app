/*
import { type PaginateResult, Types } from "mongoose";

import type { SetDTO } from "../session/session.dto.js";
import type {
  ExerciseStatsDTO,
  GetExerciseStatsByIdInputDTO,
  GetExerciseStatsListInputDTO,
  UpdateExerciseStatsInputDTO,
  UpdateFromSessionInputDTO,
} from "./exerciseStats.dto.js";

import { AppError } from "../../errors/AppError.js";
import { ExerciseStatsModel } from "../../models/ExerciseStats.model.js";
import { ERROR_CODES } from "../../types/error.types.js";
import {
  mapPaginatedExerciseStats,
  toExerciseStatsDTO,
} from "./exerciseStats.mapper.js";
import {
  addToSessionHistory,
  buildSessionHistoryEntry,
  resolvePersonalRecord,
} from "./exerciseStats.helpers.js";

function findTopSet(sets: SetDTO[]): SetDTO {
  let topSet = sets[0] ?? { weight: 0, reps: 0 };

  for (const set of sets) {
    if (
      set.weight > topSet.weight ||
      (set.weight === topSet.weight && set.reps > topSet.reps)
    ) {
      topSet = set;
    }
  }

  return topSet;
}

async function getExerciseStatsById(
  input: GetExerciseStatsByIdInputDTO,
): Promise<ExerciseStatsDTO> {
  const { exerciseId, userId } = input;
  const stats = await ExerciseStatsModel.findOne({
    exerciseId,
    userId,
  })
    .populate("exerciseId", "name primaryMuscle equipment")
    .lean();
  if (!stats) {
    throw new AppError("Exercise stats not found", 404, ERROR_CODES.NOT_FOUND);
  }
  return toExerciseStatsDTO(
    stats as unknown as Parameters<typeof toExerciseStatsDTO>[0],
  );
}

// Add better filtering, sorting by exercise fields
async function getExerciseStatsList(
  input: GetExerciseStatsListInputDTO,
): Promise<PaginateResult<ExerciseStatsDTO>> {
  const { filters = {}, pagination = {}, userId } = input;

  const queryOptions: Record<string, unknown> = {
    isActive: true,
    userId,
  };

  if (filters.isFavorite !== undefined)
    queryOptions.isFavorite = filters.isFavorite;

  const paginationOptions = {
    lean: true,
    limit: pagination.limit ?? 20,
    page: pagination.page ?? 1,
    populate: { path: "exerciseId", select: "name primaryMuscle equipment" },
    select: "-__v",
  };

  const result = await ExerciseStatsModel.paginate(
    queryOptions,
    paginationOptions,
  );
  return mapPaginatedExerciseStats(
    result as unknown as Parameters<typeof mapPaginatedExerciseStats>[0],
  );
}

async function updateExerciseStats(
  input: UpdateExerciseStatsInputDTO,
): Promise<ExerciseStatsDTO> {
  const { exerciseId, updates, userId } = input;
  const ALLOWED_UPDATES = [
    "isFavorite",
    "needsFormCheck",
    "isInjuryModified",
    "difficultyRating",
    "enjoymentRating",
    "formNotes",
    "injuryNotes",
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
    .select("-__v")
    .populate("exerciseId", "name primaryMuscle equipment")
    .lean();

  if (!stats) {
    throw new AppError("Exercise stats not found", 404, ERROR_CODES.NOT_FOUND);
  }

  return toExerciseStatsDTO(
    stats as unknown as Parameters<typeof toExerciseStatsDTO>[0],
  );
}

async function updateFromSession(
  input: UpdateFromSessionInputDTO,
): Promise<void> {
  const { session, userId } = input;

  for (const exercise of session.exercises) {
    if (!userId || !exercise.exerciseId) {
      throw new Error("userId and exerciseId are required");
    }

    const profile =
      (await ExerciseStatsModel.findOne({
        userId,
        exerciseId: exercise.exerciseId,
      })) ??
      (await ExerciseStatsModel.create({
        userId,
        exerciseId: exercise.exerciseId,
      }));

    const topSet = findTopSet(exercise.sets);
    const now = new Date();

    profile.lastPerformed = {
      date: now,
      weight: topSet.weight,
      reps: topSet.reps,
      sets: exercise.sets.length,
    };
    profile.recentSessions = addToSessionHistory(
      profile.recentSessions,
      buildSessionHistoryEntry(
        new Types.ObjectId(session.id),
        topSet.weight,
        topSet.reps,
        exercise.sets.length,
        now,
      ),
    );
    profile.set(
      "personalRecord",
      resolvePersonalRecord(profile.personalRecord, {
        weight: topSet.weight,
        reps: topSet.reps,
      }),
    );
    profile.metrics.totalSessions = (profile.metrics.totalSessions || 0) + 1;

    await profile.save();
  }
}

export const ExerciseStatsService = {
  getExerciseStatsById,
  getExerciseStatsList,
  updateExerciseStats,
  updateFromSession,
};
*/
