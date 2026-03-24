import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/AppError.js";
import { ERROR_CODES } from "../../types/error.types.js";
import {
  buildCursorArgs,
  paginateCursorResult,
  type CursorPage,
} from "../../lib/pagination.js";
import type { ProgramModel } from "../../generated/prisma/models.js";
import type {
  GetProgramsDTO,
  GetProgramByIdDTO,
  UpdateProgramDTO,
  DeleteProgramDTO,
  CreateCustomProgramDTO,
  CreateFromTemplateDTO,
  GetActiveProgramDTO,
  AddProgramWorkoutDTO,
  UpdateProgramWorkoutDTO,
  DeleteProgramWorkoutDTO,
  AddWorkoutExerciseDTO,
  UpdateWorkoutExerciseDTO,
  DeleteWorkoutExerciseDTO,
  BulkReorderWorkoutExercisesDTO,
} from "./program.dtos.js";

async function getPrograms(
  input: GetProgramsDTO,
): Promise<CursorPage<ProgramModel>> {
  const { userId, difficulty, goal, splitType, status, createdFrom } = input;
  const { cursor, limit } = input;
  const items = await prisma.program.findMany({
    where: {
      userId,
      difficulty,
      goal,
      splitType,
      status,
      createdFrom,
    },
    orderBy: { createdAt: "desc" },
    ...buildCursorArgs({ cursor, limit }),
  });
  return paginateCursorResult(items, limit);
}

async function createFromTemplate(
  input: CreateFromTemplateDTO,
): Promise<ProgramModel> {
  const { userId, templateId, name, startDate } = input;

  const template = await prisma.template.findUnique({
    where: { id: templateId },
    include: { workouts: { include: { exercises: true } } },
  });
  if (!template) {
    throw new AppError("Template not found", 404, ERROR_CODES.NOT_FOUND);
  }

  const programName = name ?? template.name;

  const existing = await prisma.program.findFirst({
    where: { userId, name: programName },
  });
  if (existing) {
    throw new AppError(
      "Program with this name already exists",
      409,
      ERROR_CODES.DUPLICATE_VALUE,
    );
  }

  return prisma.program.create({
    data: {
      userId,
      sourceTemplateId: templateId,
      sourceTemplateName: template.name,
      createdFrom: "template",
      name: programName,
      description: template.description,
      difficulty: template.difficulty,
      goal: template.goal,
      splitType: template.splitType,
      daysPerWeek: template.daysPerWeek,
      status: "active",
      startDate: startDate ? new Date(startDate) : new Date(),
      programWorkouts: {
        create: template.workouts.map((workout) => ({
          name: workout.name,
          dayNumber: workout.dayNumber,
          programWorkoutExercises: {
            create: workout.exercises.map((ex) => ({
              exerciseId: ex.exerciseId,
              order: ex.order,
              targetSets: ex.targetSets,
              notes: ex.notes,
            })),
          },
        })),
      },
    },
    include: {
      programWorkouts: {
        include: { programWorkoutExercises: true },
      },
    },
  });
}

async function createCustomProgram(
  input: CreateCustomProgramDTO,
): Promise<ProgramModel> {
  const { userId, name } = input;

  const existing = await prisma.program.findFirst({
    where: { userId, name },
  });
  if (existing) {
    throw new AppError(
      "Program with this name already exists",
      409,
      ERROR_CODES.DUPLICATE_VALUE,
    );
  }

  return prisma.program.create({
    data: {
      userId,
      name,
      description: input.description,
      difficulty: input.difficulty,
      goal: input.goal,
      splitType: input.splitType,
      daysPerWeek: input.daysPerWeek,
      createdFrom: "scratch",
      status: "active",
      startDate: input.startDate ? new Date(input.startDate) : new Date(),
      programWorkouts: {
        create: input.workouts.map((workout) => ({
          name: workout.name,
          dayNumber: workout.dayNumber,
          programWorkoutExercises: {
            create: workout.exercises.map((ex) => ({
              exerciseId: ex.exerciseId,
              order: ex.order,
              targetSets: ex.targetSets,
              targetWeight: ex.targetWeight,
              targetTotalReps: ex.targetTotalReps,
              targetTopSetReps: ex.targetTopSetReps,
              targetRir: ex.targetRir,
            })),
          },
        })),
      },
    },
    include: {
      programWorkouts: {
        include: { programWorkoutExercises: true },
      },
    },
  });
}

async function getActiveProgram(
  input: GetActiveProgramDTO,
): Promise<ProgramModel[]> {
  const { userId } = input;
  return prisma.program.findMany({
    where: {
      userId,
      status: "active",
    },
    include: {
      programWorkouts: {
        include: { programWorkoutExercises: true },
      },
    },
  });
}

async function getProgramById(input: GetProgramByIdDTO): Promise<ProgramModel> {
  const { programId, userId } = input;
  const program = await prisma.program.findUnique({
    where: { id: programId, userId },
    include: {
      programWorkouts: {
        include: { programWorkoutExercises: true },
      },
    },
  });
  if (!program) {
    throw new AppError("Program not found", 404, ERROR_CODES.NOT_FOUND);
  }
  return program;
}

async function updateProgram(input: UpdateProgramDTO): Promise<ProgramModel> {
  const {
    programId,
    userId,
    name,
    description,
    difficulty,
    goal,
    splitType,
    daysPerWeek,
    status,
    startDate,
  } = input;

  const existing = await prisma.program.findUnique({
    where: { id: programId },
  });
  if (existing?.userId !== userId) {
    throw new AppError("Program not found", 404, ERROR_CODES.NOT_FOUND);
  }

  return prisma.program.update({
    where: { id: programId },
    data: {
      name,
      description,
      difficulty,
      goal,
      splitType,
      daysPerWeek,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
    },
    include: {
      programWorkouts: {
        include: { programWorkoutExercises: true },
      },
    },
  });
}

async function deleteProgram(input: DeleteProgramDTO): Promise<void> {
  const { programId, userId } = input;

  const existing = await prisma.program.findUnique({
    where: { id: programId },
  });
  if (existing?.userId !== userId) {
    throw new AppError("Program not found", 404, ERROR_CODES.NOT_FOUND);
  }

  await prisma.program.delete({ where: { id: programId } });
}

async function addProgramWorkout(input: AddProgramWorkoutDTO) {
  const { programId, userId, name, dayNumber } = input;

  const existing = await prisma.program.findUnique({
    where: { id: programId },
  });
  if (existing?.userId !== userId) {
    throw new AppError("Program not found", 404, ERROR_CODES.NOT_FOUND);
  }

  return prisma.programWorkout.create({
    data: {
      programId,
      name,
      dayNumber,
    },
  });
}

async function updateProgramWorkout(input: UpdateProgramWorkoutDTO) {
  const { programId, workoutId, userId, name, dayNumber } = input;

  const existing = await prisma.program.findUnique({
    where: { id: programId },
  });
  if (existing?.userId !== userId) {
    throw new AppError("Program not found", 404, ERROR_CODES.NOT_FOUND);
  }

  const workout = await prisma.programWorkout.findUnique({
    where: { id: workoutId, programId },
  });
  if (!workout) {
    throw new AppError("Workout not found", 404, ERROR_CODES.NOT_FOUND);
  }

  return prisma.programWorkout.update({
    where: { id: workoutId },
    data: {
      name,
      dayNumber,
    },
  });
}

async function deleteProgramWorkout(input: DeleteProgramWorkoutDTO) {
  const { programId, workoutId, userId } = input;

  const existing = await prisma.program.findUnique({
    where: { id: programId },
  });
  if (existing?.userId !== userId) {
    throw new AppError("Program not found", 404, ERROR_CODES.NOT_FOUND);
  }

  const workout = await prisma.programWorkout.findUnique({
    where: { id: workoutId, programId },
  });
  if (!workout) {
    throw new AppError("Workout not found", 404, ERROR_CODES.NOT_FOUND);
  }

  await prisma.programWorkout.delete({ where: { id: workoutId } });
}

async function addWorkoutExercise(input: AddWorkoutExerciseDTO) {
  const {
    programId,
    workoutId,
    userId,
    exerciseId,
    order,
    targetSets,
    targetWeight,
    targetTotalReps,
    targetTopSetReps,
    targetRir,
  } = input;

  const existing = await prisma.program.findUnique({
    where: { id: programId },
  });
  if (existing?.userId !== userId) {
    throw new AppError("Program not found", 404, ERROR_CODES.NOT_FOUND);
  }

  const workout = await prisma.programWorkout.findUnique({
    where: { id: workoutId, programId },
  });
  if (!workout) {
    throw new AppError("Workout not found", 404, ERROR_CODES.NOT_FOUND);
  }

  const orderConflict = await prisma.programWorkoutExercise.findFirst({
    where: { programWorkoutId: workoutId, order },
  });
  if (orderConflict) {
    throw new AppError(
      "An exercise with this order already exists in the workout",
      409,
      ERROR_CODES.DUPLICATE_VALUE,
    );
  }

  return prisma.programWorkoutExercise.create({
    data: {
      programWorkoutId: workoutId,
      exerciseId,
      order,
      targetSets,
      targetWeight,
      targetTotalReps,
      targetTopSetReps,
      targetRir,
    },
  });
}

async function updateWorkoutExercise(input: UpdateWorkoutExerciseDTO) {
  const {
    programId,
    workoutId,
    workoutExerciseId,
    userId,
    order,
    targetSets,
    targetWeight,
    targetTotalReps,
    targetTopSetReps,
    targetRir,
  } = input;

  const existing = await prisma.program.findUnique({
    where: { id: programId },
  });
  if (existing?.userId !== userId) {
    throw new AppError("Program not found", 404, ERROR_CODES.NOT_FOUND);
  }

  const workout = await prisma.programWorkout.findUnique({
    where: { id: workoutId, programId },
  });
  if (!workout) {
    throw new AppError("Workout not found", 404, ERROR_CODES.NOT_FOUND);
  }

  const exercise = await prisma.programWorkoutExercise.findUnique({
    where: { id: workoutExerciseId, programWorkoutId: workoutId },
  });
  if (!exercise) {
    throw new AppError("Exercise not found", 404, ERROR_CODES.NOT_FOUND);
  }

  return prisma.programWorkoutExercise.update({
    where: { id: workoutExerciseId },
    data: {
      order,
      targetSets,
      targetWeight,
      targetTotalReps,
      targetTopSetReps,
      targetRir,
    },
  });
}

async function bulkReorderWorkoutExercises(
  input: BulkReorderWorkoutExercisesDTO,
) {
  const { programId, workoutId, userId, exercises } = input;

  const program = await prisma.program.findUnique({ where: { id: programId } });
  if (program?.userId !== userId) {
    throw new AppError("Program not found", 404, ERROR_CODES.NOT_FOUND);
  }

  const workout = await prisma.programWorkout.findUnique({
    where: { id: workoutId, programId },
  });
  if (!workout) {
    throw new AppError("Workout not found", 404, ERROR_CODES.NOT_FOUND);
  }

  const existingExercises = await prisma.programWorkoutExercise.findMany({
    where: { programWorkoutId: workoutId },
    select: { id: true },
  });
  const existingIds = new Set(existingExercises.map((e) => e.id));

  if (exercises.length !== existingIds.size) {
    throw new AppError(
      "All exercises in the workout must be included in the reorder",
      400,
      ERROR_CODES.INVALID_INPUT,
    );
  }

  const invalidId = exercises.find((e) => !existingIds.has(e.id));
  if (invalidId) {
    throw new AppError(
      `Exercise ${invalidId.id} does not belong to this workout`,
      400,
      ERROR_CODES.INVALID_INPUT,
    );
  }

  const orders = exercises.map((e) => e.order);
  if (new Set(orders).size !== orders.length) {
    throw new AppError(
      "Duplicate order values are not allowed",
      400,
      ERROR_CODES.INVALID_INPUT,
    );
  }

  return prisma.$transaction(
    exercises.map((e) =>
      prisma.programWorkoutExercise.update({
        where: { id: e.id },
        data: { order: e.order },
      }),
    ),
  );
}

async function deleteWorkoutExercise(input: DeleteWorkoutExerciseDTO) {
  const { programId, workoutId, workoutExerciseId, userId } = input;

  const existing = await prisma.program.findUnique({
    where: { id: programId },
  });
  if (existing?.userId !== userId) {
    throw new AppError("Program not found", 404, ERROR_CODES.NOT_FOUND);
  }

  const workout = await prisma.programWorkout.findUnique({
    where: { id: workoutId, programId },
  });
  if (!workout) {
    throw new AppError("Workout not found", 404, ERROR_CODES.NOT_FOUND);
  }

  const exercise = await prisma.programWorkoutExercise.findUnique({
    where: { id: workoutExerciseId, programWorkoutId: workoutId },
  });
  if (!exercise) {
    throw new AppError("Exercise not found", 404, ERROR_CODES.NOT_FOUND);
  }

  await prisma.programWorkoutExercise.delete({
    where: { id: workoutExerciseId },
  });
}

export const ProgramService = {
  getPrograms,
  createFromTemplate,
  createCustomProgram,
  getActiveProgram,
  getProgramById,
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
