import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import { ERROR_CODES } from "../../types/error.types";
import type { TemplateModel } from "../../generated/prisma/models";
import {
  buildCursorArgs,
  paginateCursorResult,
  type CursorPage,
} from "../../lib/pagination";
import type {
  GetTemplatesDTO,
  GetTemplateByIdDTO,
  CreateTemplateDTO,
  UpdateTemplateDTO,
  DeleteTemplateDTO,
} from "./template.dtos";

async function getTemplates(
  input: GetTemplatesDTO,
): Promise<CursorPage<TemplateModel>> {
  const { splitType, difficulty, daysPerWeek, userId, myTemplatesOnly } = input;
  const { cursor, limit } = input;
  const items = await prisma.template.findMany({
    where: {
      splitType,
      difficulty,
      daysPerWeek,
      ...(myTemplatesOnly && userId
        ? { createdByUserId: userId }
        : { OR: [{ createdByUserId: null }, { createdByUserId: userId }] }),
    },
    orderBy: { id: "asc" },
    ...buildCursorArgs({ cursor, limit }),
  });

  return paginateCursorResult(items, limit);
}

async function getTemplateById(
  input: GetTemplateByIdDTO,
): Promise<TemplateModel> {
  const { id } = input;

  const template = await prisma.template.findUnique({
    where: { id },
    include: { workouts: { include: { exercises: true } } },
  });

  if (!template) {
    throw new AppError("Template not found", 404, ERROR_CODES.NOT_FOUND);
  }

  return template;
}

async function createTemplate(
  input: CreateTemplateDTO,
): Promise<TemplateModel> {
  const { workouts, ...rest } = input;
  const template = await prisma.template.create({
    data: {
      ...rest,
      workouts: {
        create: workouts.map((workout) => ({
          name: workout.name,
          dayNumber: workout.dayNumber,
          exercises: {
            create: workout.exercises.map((exercise) => ({
              exerciseId: exercise.exerciseId,
              order: exercise.order,
              targetSets: exercise.targetSets,
              notes: exercise.notes,
            })),
          },
        })),
      },
    },
    include: { workouts: { include: { exercises: true } } },
  });
  return template;
}

async function updateTemplate(
  input: UpdateTemplateDTO,
): Promise<TemplateModel> {
  const {
    templateId,
    userId,
    userRole,
    name,
    description,
    daysPerWeek,
    difficulty,
    splitType,
    goal,
    workouts,
  } = input;
  const existing = await prisma.template.findUnique({
    where: { id: templateId },
  });

  if (!existing) {
    throw new AppError("Template not found", 404, ERROR_CODES.NOT_FOUND);
  }

  const isSystemTemplate = existing.createdByUserId === null;
  if (isSystemTemplate && userRole !== "admin") {
    throw new AppError(
      "Insufficient permissions",
      403,
      ERROR_CODES.INSUFFICIENT_PERMISSIONS,
    );
  }
  if (!isSystemTemplate && existing.createdByUserId !== userId) {
    throw new AppError(
      "Insufficient permissions",
      403,
      ERROR_CODES.INSUFFICIENT_PERMISSIONS,
    );
  }

  const template = await prisma.template.update({
    where: { id: templateId },
    data: {
      name,
      description,
      daysPerWeek,
      difficulty,
      splitType,
      goal,
      workouts: workouts
        ? {
            deleteMany: {}, // Delete existing workouts and exercises
            create: workouts.map((workout) => ({
              name: workout.name,
              dayNumber: workout.dayNumber,
              exercises: {
                create: workout.exercises.map((exercise) => ({
                  exerciseId: exercise.exerciseId,
                  order: exercise.order,
                  targetSets: exercise.targetSets,
                  notes: exercise.notes,
                })),
              },
            })),
          }
        : undefined,
    },
    include: { workouts: { include: { exercises: true } } },
  });

  return template;
}

async function deleteTemplate(input: DeleteTemplateDTO): Promise<void> {
  const { templateId, userId, userRole } = input;

  const existing = await prisma.template.findUnique({
    where: { id: templateId },
  });

  if (!existing) {
    throw new AppError("Template not found", 404, ERROR_CODES.NOT_FOUND);
  }

  const isSystemTemplate = existing.createdByUserId === null;
  if (isSystemTemplate && userRole !== "admin") {
    throw new AppError(
      "Insufficient permissions",
      403,
      ERROR_CODES.INSUFFICIENT_PERMISSIONS,
    );
  }
  if (!isSystemTemplate && existing.createdByUserId !== userId) {
    throw new AppError(
      "Insufficient permissions",
      403,
      ERROR_CODES.INSUFFICIENT_PERMISSIONS,
    );
  }

  await prisma.template.delete({ where: { id: templateId } });
}

export const TemplateService = {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
};
