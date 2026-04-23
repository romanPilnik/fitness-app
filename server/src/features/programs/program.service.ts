import type { Prisma } from "@/generated/prisma/client.js";
import {
  ProgramScheduleKind,
  OccurrenceStatus,
} from "@/generated/prisma/enums.js";
import { prisma } from "@/lib/prisma.js";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "@/errors/index.js";
import { ERROR_CODES } from "@/types/error.types.js";
import {
  buildCursorArgs,
  paginateCursorResult,
  type CursorPage,
} from "@/lib/pagination.js";
import type { ProgramModel } from "@/generated/prisma/models.js";
import type {
  GetProgramsDTO,
  ProgramListSort,
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
  GetProgramOccurrencesDTO,
  GetNextWorkoutDTO,
  PatchOccurrenceDTO,
} from "./program.dtos.js";
import {
  buildDefaultSyncPattern,
  buildOccurrenceCreateMany,
  dateKeyToDbDate,
  parseSchedulePatternJson,
  resolveSchedulePatternFromIndices,
  validateSchedulePattern,
} from "./programSchedule.js";

/** Nested exercise id+name for program workout slots (API responses). */
const programWithWorkoutsInclude = {
  programWorkouts: {
    orderBy: { sequenceIndex: "asc" as const },
    include: {
      programWorkoutExercises: {
        include: {
          exercise: { select: { id: true, name: true } },
        },
      },
    },
  },
} as const;

async function replaceOccurrencesForProgram(
  db: Prisma.TransactionClient | typeof prisma,
  programId: string,
  timeZone: string,
): Promise<void> {
  const program = await db.program.findUnique({
    where: { id: programId },
    include: { programWorkouts: { select: { id: true } } },
  });
  if (!program) return;
  const pattern = parseSchedulePatternJson(program.schedulePattern);
  if (pattern.length === 0) {
    await db.programWorkoutOccurrence.deleteMany({ where: { programId } });
    return;
  }
  const ids = new Set(program.programWorkouts.map((w) => w.id));
  validateSchedulePattern(program.scheduleKind, pattern, ids);
  await db.programWorkoutOccurrence.deleteMany({ where: { programId } });
  const rows = buildOccurrenceCreateMany({
    programId,
    lengthWeeks: program.lengthWeeks,
    scheduleKind: program.scheduleKind,
    schedulePattern: pattern,
    startDate: program.startDate,
    timeZone,
  });
  if (rows.length > 0) {
    await db.programWorkoutOccurrence.createMany({ data: rows });
  }
}

function programListOrderBy(
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

async function getPrograms(
  input: GetProgramsDTO,
): Promise<CursorPage<ProgramModel>> {
  const { userId, difficulty, goal, splitType, status, createdFrom, sort } =
    input;
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
    orderBy: programListOrderBy(sort),
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
    throw new NotFoundError(
      "Template not found",
      ERROR_CODES.PROGRAM_TEMPLATE_NOT_FOUND,
    );
  }

  const programName = name ?? template.name;

  const existing = await prisma.program.findFirst({
    where: { userId, name: programName },
  });
  if (existing) {
    throw new ConflictError(
      "Program with this name already exists",
      ERROR_CODES.PROGRAM_NAME_EXISTS,
    );
  }

  const start = startDate ? new Date(startDate) : new Date();
  const program = await prisma.program.create({
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
      startDate: start,
      lengthWeeks: input.lengthWeeks ?? 8,
      scheduleKind: ProgramScheduleKind.sync_week,
      schedulePattern: [],
      programWorkouts: {
        create: template.workouts.map((workout) => ({
          name: workout.name,
          dayNumber: workout.dayNumber,
          sequenceIndex: workout.dayNumber,
          programWorkoutExercises: {
            create: workout.exercises.map((ex) => ({
              exerciseId: ex.exerciseId,
              order: ex.order,
              targetSets: ex.targetSets,
              targetWeight: ex.targetWeight,
              targetTotalReps: ex.targetTotalReps,
              targetTopSetReps: ex.targetTopSetReps,
              targetRir: ex.targetRir,
              notes: ex.notes,
            })),
          },
        })),
      },
    },
    include: programWithWorkoutsInclude,
  });

  const ordered = [...program.programWorkouts].sort(
    (a, b) => a.sequenceIndex - b.sequenceIndex,
  );
  const pattern = buildDefaultSyncPattern(
    ordered.map((w) => w.id),
    template.daysPerWeek,
  );

  await prisma.program.update({
    where: { id: program.id },
    data: {
      schedulePattern: pattern as unknown as Prisma.InputJsonValue,
    },
  });

  await replaceOccurrencesForProgram(
    prisma,
    program.id,
    input.timeZone ?? "UTC",
  );

  return prisma.program.findUniqueOrThrow({
    where: { id: program.id },
    include: programWithWorkoutsInclude,
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
    throw new ConflictError(
      "Program with this name already exists",
      ERROR_CODES.PROGRAM_NAME_EXISTS,
    );
  }

  const program = await prisma.program.create({
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
      lengthWeeks: input.lengthWeeks ?? 8,
      scheduleKind: input.scheduleKind,
      schedulePattern: [],
      programWorkouts: {
        create: input.workouts.map((workout, idx) => ({
          name: workout.name,
          dayNumber: workout.dayNumber,
          sequenceIndex: idx + 1,
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
    include: programWithWorkoutsInclude,
  });

  const idsInOrder = [...program.programWorkouts]
    .sort((a, b) => a.sequenceIndex - b.sequenceIndex)
    .map((w) => w.id);
  const resolved = resolveSchedulePatternFromIndices(
    input.schedulePattern,
    idsInOrder,
  );
  validateSchedulePattern(
    input.scheduleKind,
    resolved,
    new Set(idsInOrder),
  );

  await prisma.program.update({
    where: { id: program.id },
    data: {
      schedulePattern: resolved as unknown as Prisma.InputJsonValue,
    },
  });

  await replaceOccurrencesForProgram(
    prisma,
    program.id,
    input.timeZone ?? "UTC",
  );

  return prisma.program.findUniqueOrThrow({
    where: { id: program.id },
    include: programWithWorkoutsInclude,
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
    include: programWithWorkoutsInclude,
  });
}

async function getProgramById(input: GetProgramByIdDTO): Promise<ProgramModel> {
  const { programId, userId } = input;
  const program = await prisma.program.findUnique({
    where: { id: programId, userId },
    include: programWithWorkoutsInclude,
  });
  if (!program) {
    throw new NotFoundError("Program not found", ERROR_CODES.PROGRAM_NOT_FOUND);
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
    lengthWeeks,
    scheduleKind,
    schedulePattern,
    timeZone,
  } = input;

  const existing = await prisma.program.findUnique({
    where: { id: programId },
  });
  if (existing?.userId !== userId) {
    throw new NotFoundError("Program not found", ERROR_CODES.PROGRAM_NOT_FOUND);
  }

  const patternData =
    schedulePattern !== undefined
      ? ({
          schedulePattern: schedulePattern as unknown as Prisma.InputJsonValue,
        } as const)
      : ({} as const);

  const updated = await prisma.program.update({
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
      lengthWeeks,
      scheduleKind,
      ...patternData,
    },
    include: programWithWorkoutsInclude,
  });

  const shouldRematerialize =
    lengthWeeks !== undefined ||
    scheduleKind !== undefined ||
    schedulePattern !== undefined ||
    startDate !== undefined;
  if (shouldRematerialize) {
    await replaceOccurrencesForProgram(
      prisma,
      programId,
      timeZone ?? "UTC",
    );
    return prisma.program.findUniqueOrThrow({
      where: { id: programId },
      include: programWithWorkoutsInclude,
    });
  }

  return updated;
}

async function deleteProgram(input: DeleteProgramDTO): Promise<void> {
  const { programId, userId } = input;

  const existing = await prisma.program.findUnique({
    where: { id: programId },
  });
  if (existing?.userId !== userId) {
    throw new NotFoundError("Program not found", ERROR_CODES.PROGRAM_NOT_FOUND);
  }

  await prisma.program.delete({ where: { id: programId } });
}

async function addProgramWorkout(input: AddProgramWorkoutDTO) {
  const { programId, userId, name, dayNumber } = input;

  const existing = await prisma.program.findUnique({
    where: { id: programId },
  });
  if (existing?.userId !== userId) {
    throw new NotFoundError("Program not found", ERROR_CODES.PROGRAM_NOT_FOUND);
  }

  const agg = await prisma.programWorkout.aggregate({
    where: { programId },
    _max: { sequenceIndex: true },
  });
  const nextSeq = (agg._max.sequenceIndex ?? 0) + 1;

  return prisma.programWorkout.create({
    data: {
      programId,
      name,
      dayNumber,
      sequenceIndex: nextSeq,
    },
  });
}

async function updateProgramWorkout(input: UpdateProgramWorkoutDTO) {
  const { programId, workoutId, userId, name, dayNumber } = input;

  const existing = await prisma.program.findUnique({
    where: { id: programId },
  });
  if (existing?.userId !== userId) {
    throw new NotFoundError("Program not found", ERROR_CODES.PROGRAM_NOT_FOUND);
  }

  const workout = await prisma.programWorkout.findUnique({
    where: { id: workoutId, programId },
  });
  if (!workout) {
    throw new NotFoundError("Workout not found", ERROR_CODES.WORKOUT_NOT_FOUND);
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
    throw new NotFoundError("Program not found", ERROR_CODES.PROGRAM_NOT_FOUND);
  }

  const workout = await prisma.programWorkout.findUnique({
    where: { id: workoutId, programId },
  });
  if (!workout) {
    throw new NotFoundError("Workout not found", ERROR_CODES.WORKOUT_NOT_FOUND);
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
    throw new NotFoundError("Program not found", ERROR_CODES.PROGRAM_NOT_FOUND);
  }

  const workout = await prisma.programWorkout.findUnique({
    where: { id: workoutId, programId },
  });
  if (!workout) {
    throw new NotFoundError("Workout not found", ERROR_CODES.WORKOUT_NOT_FOUND);
  }

  const orderConflict = await prisma.programWorkoutExercise.findFirst({
    where: { programWorkoutId: workoutId, order },
  });
  if (orderConflict) {
    throw new ConflictError(
      "An exercise with this order already exists in the workout",
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
    throw new NotFoundError("Program not found", ERROR_CODES.PROGRAM_NOT_FOUND);
  }

  const workout = await prisma.programWorkout.findUnique({
    where: { id: workoutId, programId },
  });
  if (!workout) {
    throw new NotFoundError("Workout not found", ERROR_CODES.WORKOUT_NOT_FOUND);
  }

  const exercise = await prisma.programWorkoutExercise.findUnique({
    where: { id: workoutExerciseId, programWorkoutId: workoutId },
  });
  if (!exercise) {
    throw new NotFoundError("Exercise not found", ERROR_CODES.NOT_FOUND);
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
    throw new NotFoundError("Program not found", ERROR_CODES.PROGRAM_NOT_FOUND);
  }

  const workout = await prisma.programWorkout.findUnique({
    where: { id: workoutId, programId },
  });
  if (!workout) {
    throw new NotFoundError("Workout not found", ERROR_CODES.WORKOUT_NOT_FOUND);
  }

  const existingExercises = await prisma.programWorkoutExercise.findMany({
    where: { programWorkoutId: workoutId },
    select: { id: true },
  });
  const existingIds = new Set(existingExercises.map((e) => e.id));

  if (exercises.length !== existingIds.size) {
    throw new BadRequestError(
      "All exercises in the workout must be included in the reorder",
      ERROR_CODES.INVALID_INPUT,
    );
  }

  const invalidId = exercises.find((e) => !existingIds.has(e.id));
  if (invalidId) {
    throw new BadRequestError(
      `Exercise ${invalidId.id} does not belong to this workout`,
      ERROR_CODES.INVALID_INPUT,
    );
  }

  const orders = exercises.map((e) => e.order);
  if (new Set(orders).size !== orders.length) {
    throw new BadRequestError(
      "Duplicate order values are not allowed",
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
    throw new NotFoundError("Program not found", ERROR_CODES.PROGRAM_NOT_FOUND);
  }

  const workout = await prisma.programWorkout.findUnique({
    where: { id: workoutId, programId },
  });
  if (!workout) {
    throw new NotFoundError("Workout not found", ERROR_CODES.WORKOUT_NOT_FOUND);
  }

  const exercise = await prisma.programWorkoutExercise.findUnique({
    where: { id: workoutExerciseId, programWorkoutId: workoutId },
  });
  if (!exercise) {
    throw new NotFoundError("Exercise not found", ERROR_CODES.NOT_FOUND);
  }

  await prisma.programWorkoutExercise.delete({
    where: { id: workoutExerciseId },
  });
}

async function getProgramOccurrences(input: GetProgramOccurrencesDTO) {
  const program = await prisma.program.findFirst({
    where: { id: input.programId, userId: input.userId },
    select: { id: true },
  });
  if (!program) {
    throw new NotFoundError("Program not found", ERROR_CODES.PROGRAM_NOT_FOUND);
  }

  const { dateFrom, dateTo } = input;
  const where: Prisma.ProgramWorkoutOccurrenceWhereInput = {
    programId: input.programId,
  };
  if (dateFrom !== undefined || dateTo !== undefined) {
    where.scheduledOn = {};
    if (dateFrom !== undefined) {
      where.scheduledOn.gte = dateKeyToDbDate(dateFrom);
    }
    if (dateTo !== undefined) {
      where.scheduledOn.lte = dateKeyToDbDate(dateTo);
    }
  }

  return prisma.programWorkoutOccurrence.findMany({
    where,
    orderBy: { scheduledOn: "asc" },
    include: {
      programWorkout: {
        select: { id: true, name: true, sequenceIndex: true },
      },
      session: { select: { id: true } },
    },
  });
}

async function getNextWorkout({ programId, userId }: GetNextWorkoutDTO) {
  const program = await prisma.program.findFirst({
    where: { id: programId, userId },
    select: { id: true },
  });
  if (!program) {
    throw new NotFoundError("Program not found", ERROR_CODES.PROGRAM_NOT_FOUND);
  }

  // Earliest still-planned occurrence (backlog). Do not use scheduledOn >= today: users who miss
  // a day must still see that occurrence as "next" (catch-up) instead of jumping to a future slot.

  return prisma.programWorkoutOccurrence.findFirst({
    where: {
      programId,
      status: OccurrenceStatus.planned,
      sessionId: null,
    },
    orderBy: { scheduledOn: "asc" },
    include: {
      programWorkout: {
        include: {
          programWorkoutExercises: {
            orderBy: { order: "asc" },
            include: { exercise: { select: { id: true, name: true } } },
          },
        },
      },
    },
  });
}

async function patchOccurrence(input: PatchOccurrenceDTO) {
  const occ = await prisma.programWorkoutOccurrence.findFirst({
    where: {
      id: input.occurrenceId,
      programId: input.programId,
      program: { userId: input.userId },
    },
  });
  if (!occ) {
    throw new NotFoundError("Occurrence not found", ERROR_CODES.NOT_FOUND);
  }
  if (occ.sessionId) {
    throw new BadRequestError(
      "Cannot modify an occurrence that already has a logged session",
      ERROR_CODES.INVALID_INPUT,
    );
  }

  const data: Prisma.ProgramWorkoutOccurrenceUpdateInput = {};
  if (input.status !== undefined) {
    data.status = input.status;
  }
  if (input.scheduledOn !== undefined) {
    data.scheduledOn = dateKeyToDbDate(input.scheduledOn);
  }

  try {
    return await prisma.programWorkoutOccurrence.update({
      where: { id: occ.id },
      data,
      include: {
        programWorkout: {
          select: { id: true, name: true, sequenceIndex: true },
        },
      },
    });
  } catch (err) {
    if (
      err instanceof Error &&
      "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      throw new ConflictError(
        "Another occurrence already exists on that date",
        ERROR_CODES.DUPLICATE_VALUE,
      );
    }
    throw err;
  }
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
  getProgramOccurrences,
  getNextWorkout,
  patchOccurrence,
  replaceOccurrencesForProgram,
};
