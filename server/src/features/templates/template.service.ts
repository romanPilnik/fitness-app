import type { ProgramListSort } from "@/features/programs/program.dtos";
import { Prisma } from "../../generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { NotFoundError, AuthorizationError } from "@/errors/index";
import { ERROR_CODES } from "@/types/error.types";
import type { TemplateModel } from "@/generated/prisma/models";
import { paginateCursorResult, type CursorPage } from "@/lib/pagination";
import type {
  GetTemplatesDTO,
  GetTemplateByIdDTO,
  CreateTemplateDTO,
  UpdateTemplateDTO,
  DeleteTemplateDTO,
} from "./template.dtos";

/** Offset cursor for template list (`tpl:<n>`). Legacy id cursors are ignored (restart at 0). */
const TEMPLATE_LIST_CURSOR_PREFIX = "tpl:";

function parseTemplateListOffsetCursor(cursor: string | undefined): number {
  if (cursor === undefined || cursor === "") {
    return 0;
  }
  if (cursor.startsWith(TEMPLATE_LIST_CURSOR_PREFIX)) {
    const n = Number.parseInt(
      cursor.slice(TEMPLATE_LIST_CURSOR_PREFIX.length),
      10,
    );
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }
  return 0;
}

function encodeTemplateListOffsetCursor(offset: number): string {
  return `${TEMPLATE_LIST_CURSOR_PREFIX}${String(offset)}`;
}

function buildTemplateWhereSql(input: GetTemplatesDTO): Prisma.Sql {
  const { splitType, difficulty, goal, daysPerWeek, userId, myTemplatesOnly } =
    input;
  const parts: Prisma.Sql[] = [];

  if (myTemplatesOnly && userId) {
    parts.push(Prisma.sql`t."createdByUserId" = ${userId}`);
  } else if (userId) {
    parts.push(
      Prisma.sql`(t."createdByUserId" IS NULL OR t."createdByUserId" = ${userId})`,
    );
  } else {
    parts.push(Prisma.sql`t."createdByUserId" IS NULL`);
  }

  if (splitType !== undefined) {
    parts.push(Prisma.sql`t."splitType" = ${splitType}`);
  }
  if (difficulty !== undefined) {
    parts.push(Prisma.sql`t."difficulty" = ${difficulty}`);
  }
  if (goal !== undefined) {
    parts.push(Prisma.sql`t."goal" = ${goal}`);
  }
  if (daysPerWeek !== undefined) {
    parts.push(Prisma.sql`t."daysPerWeek" = ${daysPerWeek}`);
  }

  return Prisma.join(parts, " AND ");
}

function templateListSecondaryOrderSql(sort: ProgramListSort): Prisma.Sql {
  switch (sort) {
    case "created_desc":
      return Prisma.sql`t."createdAt" DESC, t."id" DESC`;
    case "created_asc":
      return Prisma.sql`t."createdAt" ASC, t."id" ASC`;
    case "name_asc":
      return Prisma.sql`t."name" ASC, t."id" ASC`;
    case "name_desc":
      return Prisma.sql`t."name" DESC, t."id" DESC`;
    default: {
      const _exhaustive: never = sort;
      return _exhaustive;
    }
  }
}

function buildTemplateWhereInput(
  input: GetTemplatesDTO,
): Prisma.TemplateWhereInput {
  const { splitType, difficulty, goal, daysPerWeek, userId, myTemplatesOnly } =
    input;
  return {
    ...(splitType !== undefined ? { splitType } : {}),
    ...(difficulty !== undefined ? { difficulty } : {}),
    ...(goal !== undefined ? { goal } : {}),
    ...(daysPerWeek !== undefined ? { daysPerWeek } : {}),
    ...(myTemplatesOnly && userId
      ? { createdByUserId: userId }
      : userId
        ? { OR: [{ createdByUserId: null }, { createdByUserId: userId }] }
        : { createdByUserId: null }),
  };
}

async function fetchUserLinkedTemplateIds(userId: string): Promise<Set<string>> {
  const rows = await prisma.program.findMany({
    where: {
      userId,
      sourceTemplateId: { not: null },
    },
    select: { sourceTemplateId: true },
    distinct: ["sourceTemplateId"],
  });
  return new Set(
    rows
      .map((r) => r.sourceTemplateId)
      .filter((id): id is string => id != null),
  );
}

function templateListOrderBy(
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

const templateWithWorkoutsInclude = {
  workouts: {
    include: {
      exercises: {
        include: {
          exercise: { select: { id: true, name: true } },
        },
      },
    },
  },
} as const;

export type TemplateListItem = TemplateModel & {
  hasProgramFromTemplate: boolean;
};

function mapTemplatesWithProgramFlag(
  rows: TemplateModel[],
  linkedTemplateIds: Set<string>,
): TemplateListItem[] {
  return rows.map((t) => ({
    ...t,
    hasProgramFromTemplate: linkedTemplateIds.has(t.id),
  }));
}

async function getTemplates(
  input: GetTemplatesDTO,
): Promise<CursorPage<TemplateListItem>> {
  const { userId, sort } = input;
  const { cursor, limit } = input;
  const offset = parseTemplateListOffsetCursor(cursor);

  if (userId) {
    const linkedTemplateIds = await fetchUserLinkedTemplateIds(userId);

    const idRows = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
      SELECT t.id
      FROM "Template" t
      WHERE ${buildTemplateWhereSql(input)}
      ORDER BY
        CASE WHEN EXISTS (
          SELECT 1 FROM "Program" p
          WHERE p."userId" = ${userId}
          AND p."sourceTemplateId" = t."id"
        ) THEN 0 ELSE 1 END ASC,
        ${templateListSecondaryOrderSql(sort)}
      LIMIT ${limit + 1}
      OFFSET ${offset}
    `);

    const orderedIds = idRows.map((r) => r.id);
    const hasMore = orderedIds.length > limit;
    const pageIds = hasMore ? orderedIds.slice(0, limit) : orderedIds;

    if (pageIds.length === 0) {
      return {
        data: [],
        nextCursor: null,
        hasMore: false,
      };
    }

    const rows = await prisma.template.findMany({
      where: { id: { in: pageIds } },
    });
    const byId = new Map(rows.map((r) => [r.id, r]));
    const ordered = pageIds
      .map((id) => byId.get(id))
      .filter((t): t is TemplateModel => t != null);

    return {
      data: mapTemplatesWithProgramFlag(ordered, linkedTemplateIds),
      nextCursor: hasMore ? encodeTemplateListOffsetCursor(offset + limit) : null,
      hasMore,
    };
  }

  const items = await prisma.template.findMany({
    where: buildTemplateWhereInput(input),
    orderBy: templateListOrderBy(sort),
    skip: offset,
    take: limit + 1,
  });
  const page = paginateCursorResult(items, limit);
  return {
    data: mapTemplatesWithProgramFlag(page.data, new Set()),
    nextCursor: page.hasMore
      ? encodeTemplateListOffsetCursor(offset + page.data.length)
      : null,
    hasMore: page.hasMore,
  };
}

async function getTemplateById(
  input: GetTemplateByIdDTO,
): Promise<TemplateModel> {
  const { id } = input;

  const template = await prisma.template.findUnique({
    where: { id },
    include: templateWithWorkoutsInclude,
  });

  if (!template) {
    throw new NotFoundError(
      "Template not found",
      ERROR_CODES.PROGRAM_TEMPLATE_NOT_FOUND,
    );
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
              targetWeight: exercise.targetWeight,
              targetTotalReps: exercise.targetTotalReps,
              targetTopSetReps: exercise.targetTopSetReps,
              targetRir: exercise.targetRir,
              notes: exercise.notes,
            })),
          },
        })),
      },
    },
    include: templateWithWorkoutsInclude,
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
    throw new NotFoundError(
      "Template not found",
      ERROR_CODES.PROGRAM_TEMPLATE_NOT_FOUND,
    );
  }

  const isSystemTemplate = existing.createdByUserId === null;
  if (isSystemTemplate && userRole !== "admin") {
    throw new AuthorizationError(
      "Insufficient permissions",
      ERROR_CODES.INSUFFICIENT_PERMISSIONS,
    );
  }
  if (!isSystemTemplate && existing.createdByUserId !== userId) {
    throw new AuthorizationError(
      "Insufficient permissions",
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
                  targetWeight: exercise.targetWeight,
                  targetTotalReps: exercise.targetTotalReps,
                  targetTopSetReps: exercise.targetTopSetReps,
                  targetRir: exercise.targetRir,
                  notes: exercise.notes,
                })),
              },
            })),
          }
        : undefined,
    },
    include: templateWithWorkoutsInclude,
  });

  return template;
}

async function deleteTemplate(input: DeleteTemplateDTO): Promise<void> {
  const { templateId, userId, userRole } = input;

  const existing = await prisma.template.findUnique({
    where: { id: templateId },
  });

  if (!existing) {
    throw new NotFoundError(
      "Template not found",
      ERROR_CODES.PROGRAM_TEMPLATE_NOT_FOUND,
    );
  }

  const isSystemTemplate = existing.createdByUserId === null;
  if (isSystemTemplate && userRole !== "admin") {
    throw new AuthorizationError(
      "Insufficient permissions",
      ERROR_CODES.INSUFFICIENT_PERMISSIONS,
    );
  }
  if (!isSystemTemplate && existing.createdByUserId !== userId) {
    throw new AuthorizationError(
      "Insufficient permissions",
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
