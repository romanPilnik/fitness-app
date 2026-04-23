import type { Request, Response } from "express";
import { AuthenticationError } from "@/errors/index";
import { GeneratedWorkoutStatus } from "@/generated/prisma/enums.js";
import { prisma } from "@/lib/prisma";
import { ERROR_CODES } from "@/types/error.types";
import { sendSuccess } from "@/utils/response";

function mapGeneratedToPayload(generated: {
  id: string;
  createdAt: Date;
  exercises: {
    exerciseId: string;
    order: number;
    targetSets: number;
    targetRir: number | null;
    notes: string | null;
    sets: {
      setNumber: number;
      targetWeight: number;
      targetReps: number;
      targetRir: number | null;
    }[];
  }[];
}) {
  return {
    generatedWorkoutId: generated.id,
    createdAt: generated.createdAt.toISOString(),
    exercises: generated.exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      order: ex.order,
      targetSets: ex.targetSets,
      targetRir: ex.targetRir,
      notes: ex.notes,
      sets: ex.sets.map((s) => ({
        setNumber: s.setNumber,
        targetWeight: s.targetWeight,
        targetReps: s.targetReps,
        targetRir: s.targetRir,
      })),
    })),
  };
}

async function getGeneratedTargets(
  req: Request<{ programWorkoutId: string }>,
  res: Response,
) {
  if (!req.user) {
    throw new AuthenticationError("Unauthorized", ERROR_CODES.UNAUTHENTICATED);
  }

  const generated = await prisma.generatedWorkout.findFirst({
    where: {
      programWorkoutId: req.params.programWorkoutId,
      userId: req.user.id,
      status: GeneratedWorkoutStatus.completed,
    },
    orderBy: { createdAt: "desc" },
    include: {
      exercises: {
        orderBy: { order: "asc" },
        include: {
          sets: { orderBy: { setNumber: "asc" } },
        },
      },
    },
  });

  if (!generated) {
    return res.status(404).json({ status: "error", message: "No generated targets found" });
  }

  return sendSuccess(
    res,
    mapGeneratedToPayload(generated),
    200,
    "Generated targets retrieved",
  );
}

async function getGeneratedTargetsBatch(
  req: Request<object, object, { programWorkoutIds: string[] }>,
  res: Response,
) {
  if (!req.user) {
    throw new AuthenticationError("Unauthorized", ERROR_CODES.UNAUTHENTICATED);
  }
  const programWorkoutIds = req.body.programWorkoutIds;
  const rows = await prisma.generatedWorkout.findMany({
    where: {
      userId: req.user.id,
      programWorkoutId: { in: programWorkoutIds },
      status: GeneratedWorkoutStatus.completed,
    },
    orderBy: { createdAt: "desc" },
    include: {
      exercises: {
        orderBy: { order: "asc" },
        include: {
          sets: { orderBy: { setNumber: "asc" } },
        },
      },
    },
  });
  const best = new Map<
    string,
    (typeof rows)[number]
  >();
  for (const row of rows) {
    if (!best.has(row.programWorkoutId)) {
      best.set(row.programWorkoutId, row);
    }
  }
  const items = programWorkoutIds.map((id) => {
    const g = best.get(id);
    if (!g) {
      return { programWorkoutId: id, targets: null };
    }
    return { programWorkoutId: id, targets: mapGeneratedToPayload(g) };
  });
  return sendSuccess(res, { items }, 200, "Generated targets batch retrieved");
}

export const WorkoutGenerationController = {
  getGeneratedTargets,
  getGeneratedTargetsBatch,
};
