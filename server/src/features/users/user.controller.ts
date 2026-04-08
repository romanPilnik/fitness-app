import { sendSuccess } from "@/utils/response";
import { UserService } from "./user.service";
import { AuthenticationError } from "@/errors/index";
import { ERROR_CODES } from "@/types/error.types";
import { prisma } from "@/lib/prisma";
import type { Request, Response } from "express";
import type { UpdateUserBody, ChangePasswordBody } from "./user.validation";

async function getCurrentUser(req: Request, res: Response) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.TOKEN_REQUIRED);

  // Read fresh from DB — the session cookie cache can be stale after profile updates
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
    throw new AuthenticationError("Unauthorized", ERROR_CODES.TOKEN_REQUIRED);
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

async function changePassword(
  req: Request<object, object, ChangePasswordBody>,
  res: Response,
) {
  if (!req.user)
    throw new AuthenticationError("Unauthorized", ERROR_CODES.TOKEN_REQUIRED);
  const { id } = req.user;
  const { oldPassword, newPassword } = req.body;
  await UserService.changePassword({ id, oldPassword, newPassword });
  sendSuccess(res, null, 200, "Password changed successfully");
}

export const UserController = {
  getCurrentUser,
  updateCurrentUser,
  changePassword,
};
