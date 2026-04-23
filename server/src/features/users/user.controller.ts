import { sendSuccess } from "@/utils/response";
import { UserService } from "./user.service";
import { AuthenticationError } from "@/errors/index";
import { ERROR_CODES } from "@/types/error.types";
import { prisma } from "@/lib/prisma";
import type { Request, Response } from "express";
import type { UpdateUserBody, PatchAiPreferencesBody } from "./user.validation";

async function getCurrentUser(req: Request, res: Response) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.UNAUTHENTICATED);

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      units: true,
      weekStartsOn: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return sendSuccess(res, user, 200, "User retrieved");
}

async function updateCurrentUser(
  req: Request<object, object, UpdateUserBody>,
  res: Response,
) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.UNAUTHENTICATED);
  const { id } = req.user;
  const { name, units, weekStartsOn } = req.body;
  const user = await UserService.updateUser({
    id,
    name,
    units,
    weekStartsOn,
  });
  return sendSuccess(res, user, 200, "User updated");
}

async function getAiPreferences(req: Request, res: Response) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.UNAUTHENTICATED);
  const { id } = req.user;
  const preferences = await UserService.getNormalizedAiPreferencesForUser(id);
  return sendSuccess(res, preferences, 200, "AI preferences retrieved");
}

async function patchAiPreferences(
  req: Request<object, object, PatchAiPreferencesBody>,
  res: Response,
) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.UNAUTHENTICATED);
  const { id } = req.user;
  const preferences = await UserService.patchAiPreferences({ id, patch: req.body });
  return sendSuccess(res, preferences, 200, "AI preferences updated");
}

export const UserController = {
  getCurrentUser,
  updateCurrentUser,
  getAiPreferences,
  patchAiPreferences,
};
