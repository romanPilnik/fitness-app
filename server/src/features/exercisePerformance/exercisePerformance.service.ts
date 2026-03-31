import { NotFoundError } from "@/errors/HttpErrors";
import { ERROR_CODES } from "@/errors";
import { prisma } from "@/lib/prisma";
import type {
  ExercisePerformanceExerciseSnippet,
  ExercisePerformanceSummary,
  GetExercisePerformanceDTO,
} from "./exercisePerformance.dtos";
import {
  getExercisePerformanceHistory,
  getExercisePerformancePersonalRecord,
  getExercisePerformanceLastPerformed,
} from "./exercisePerformance.helpers";

export async function getExercisePerformanceSummary(
  input: GetExercisePerformanceDTO,
): Promise<ExercisePerformanceSummary> {
  const { userId, exerciseId } = input;

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
  });

  if (!exercise) {
    throw new NotFoundError(
      "Exercise not found",
      ERROR_CODES.EXERCISE_NOT_FOUND,
    );
  }

  const exerciseSnippet: ExercisePerformanceExerciseSnippet = {
    id: exercise.id,
    name: exercise.name,
    primaryMuscle: exercise.primaryMuscle,
    equipment: exercise.equipment,
  };

  const [lastPerformed, personalRecord, recentHistory] = await Promise.all([
    getExercisePerformanceLastPerformed(exerciseId, userId),
    getExercisePerformancePersonalRecord(exerciseId, userId),
    getExercisePerformanceHistory(exerciseId, userId),
  ]);

  return {
    exerciseId,
    exercise: exerciseSnippet,
    lastPerformed,
    personalRecord,
    recentHistory,
  };
}
