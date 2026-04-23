import type { ExerciseModel } from "@/generated/prisma/models/Exercise";
import type { ProgramListSort } from "@/features/programs/program.dtos";
import type {
  GetExercisesDTO,
  GetExerciseByIdDTO,
  CreateExerciseDTO,
  UpdateExerciseDTO,
  DeleteExerciseDTO,
} from "./exercise.dtos";
import { prisma } from "@/lib/prisma";
import { NotFoundError, AuthorizationError } from "@/errors/index";
import { ERROR_CODES } from "@/types/error.types";
import type { Prisma } from "@/generated/prisma/client";
import {
  buildCursorArgs,
  paginateCursorResult,
  type CursorPage,
} from "@/lib/pagination";
import { isExerciseVisibleToUser } from "./exercise.access";

function exerciseListOrderBy(
  sort: ProgramListSort,
):
  | [{ createdAt: "desc" }, { id: "desc" }]
  | [{ createdAt: "asc" }, { id: "asc" }]
  | [{ name: "asc" }, { id: "asc" }]
  | [{ name: "desc" }, { id: "desc" }] {
  switch (sort) {
    case "created_desc":
      return [{ createdAt: "desc" }, { id: "desc" }];
    case "created_asc":
      return [{ createdAt: "asc" }, { id: "asc" }];
    case "name_asc":
      return [{ name: "asc" }, { id: "asc" }];
    case "name_desc":
      return [{ name: "desc" }, { id: "desc" }];
    default: {
      const _exhaustive: never = sort;
      return _exhaustive;
    }
  }
}

async function getExercises(
  input: GetExercisesDTO,
): Promise<CursorPage<ExerciseModel>> {
  const { primaryMuscle, equipment, category, movementPattern, userId, sort } =
    input;
  const { cursor, limit } = input;
  const items = await prisma.exercise.findMany({
    where: {
      primaryMuscle,
      equipment,
      category,
      movementPattern,
      OR: [{ createdByUserId: null }, { createdByUserId: userId }],
    },
    orderBy: exerciseListOrderBy(sort),
    ...buildCursorArgs({ cursor, limit }),
  });

  return paginateCursorResult(items, limit);
}

async function getExerciseById(
  input: GetExerciseByIdDTO,
): Promise<ExerciseModel> {
  const { id, userId } = input;

  const exercise = await prisma.exercise.findUnique({ where: { id } });
  if (!exercise) {
    throw new NotFoundError(
      "Exercise not found",
      ERROR_CODES.EXERCISE_NOT_FOUND,
    );
  }
  if (!isExerciseVisibleToUser(exercise.createdByUserId, userId)) {
    throw new NotFoundError(
      "Exercise not found",
      ERROR_CODES.EXERCISE_NOT_FOUND,
    );
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
    throw new NotFoundError(
      "Exercise not found",
      ERROR_CODES.EXERCISE_NOT_FOUND,
    );
  }
  if (existing.createdByUserId !== userId) {
    throw new AuthorizationError(
      "Insufficient permissions",
      ERROR_CODES.INSUFFICIENT_PERMISSIONS,
    );
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
    throw new NotFoundError(
      "Exercise not found",
      ERROR_CODES.EXERCISE_NOT_FOUND,
    );
  }
  if (existing.createdByUserId !== userId) {
    throw new AuthorizationError(
      "Insufficient permissions",
      ERROR_CODES.INSUFFICIENT_PERMISSIONS,
    );
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
