import type { ExerciseModel } from "../../generated/prisma/models/Exercise";
import type {
  GetExercisesDTO,
  GetExerciseByIdDTO,
  CreateExerciseDTO,
  UpdateExerciseDTO,
  DeleteExerciseDTO,
} from "./exercise.dtos";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import { ERROR_CODES } from "../../types/error.types";
import type { Prisma } from "../../generated/prisma/client";
import {
  buildCursorArgs,
  paginateCursorResult,
  type CursorPage,
} from "../../lib/pagination";

async function getExercises(
  input: GetExercisesDTO,
): Promise<CursorPage<ExerciseModel>> {
  const { primaryMuscle, equipment, category, movementPattern, userId } = input;
  const { cursor, limit } = input;
  const items = await prisma.exercise.findMany({
    where: {
      primaryMuscle,
      equipment,
      category,
      movementPattern,
      OR: [{ createdByUserId: null }, { createdByUserId: userId }],
    },
    orderBy: { id: "asc" },
    ...buildCursorArgs({ cursor, limit }),
  });

  return paginateCursorResult(items, limit);
}

async function getExerciseById(
  input: GetExerciseByIdDTO,
): Promise<ExerciseModel> {
  const { id } = input;

  const exercise = await prisma.exercise.findUnique({ where: { id } });
  if (!exercise) {
    throw new AppError("Exercise not found", 404, ERROR_CODES.NOT_FOUND);
  }
  return exercise;
}

async function createExercise(
  input: CreateExerciseDTO,
): Promise<ExerciseModel> {
  const data: Prisma.ExerciseUncheckedCreateInput = input;
  const exercise = await prisma.exercise.create({ data });
  return exercise;
}

async function updateExercise(
  input: UpdateExerciseDTO,
): Promise<ExerciseModel> {
  const { id, userId } = input;

  const existing = await prisma.exercise.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Exercise not found", 404, ERROR_CODES.NOT_FOUND);
  }
  if (existing.createdByUserId !== userId) {
    throw new AppError("Insufficient permissions", 403, ERROR_CODES.INSUFFICIENT_PERMISSIONS);
  }

  const {
    name,
    equipment,
    primaryMuscle,
    secondaryMuscles,
    category,
    movementPattern,
    instructions,
  } = input;
  const updatedExercise = await prisma.exercise.update({
    where: { id },
    data: {
      name,
      equipment,
      primaryMuscle,
      secondaryMuscles,
      category,
      movementPattern,
      instructions,
    },
  });
  return updatedExercise;
}

async function deleteExercise(input: DeleteExerciseDTO): Promise<void> {
  const { id, userId } = input;

  const existing = await prisma.exercise.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Exercise not found", 404, ERROR_CODES.NOT_FOUND);
  }
  if (existing.createdByUserId !== userId) {
    throw new AppError("Insufficient permissions", 403, ERROR_CODES.INSUFFICIENT_PERMISSIONS);
  }

  await prisma.exercise.delete({ where: { id } });
}

export const ExerciseService = {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
};
