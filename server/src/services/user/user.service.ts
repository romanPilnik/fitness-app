import {
  NotFoundError,
  AuthenticationError,
  BadRequestError,
} from "../../errors/index";
import { ERROR_CODES } from "../../types/error.types";
import bcrypt from "bcryptjs";
import type { ChangePasswordDTO, UpdateUserDTO } from "./user.dtos";
import { prisma } from "../../lib/prisma";
import type { UserModel } from "../../generated/prisma/models";

async function changePassword(input: ChangePasswordDTO): Promise<void> {
  const { id, oldPassword, newPassword } = input;

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new NotFoundError("User not found", ERROR_CODES.USER_NOT_FOUND);
  }
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new AuthenticationError(
      "Incorrect old password",
      ERROR_CODES.PASSWORD_MISMATCH,
    );
  }

  if (newPassword === oldPassword) {
    throw new BadRequestError(
      "New password must be different from the old password",
      ERROR_CODES.INVALID_INPUT,
    );
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });
}

async function updateUser(
  input: UpdateUserDTO,
): Promise<Omit<UserModel, "password">> {
  const { id, name, units, weekStartsOn } = input;

  const user = await prisma.user.update({
    where: { id },
    data: { name, units, weekStartsOn },
  });

  const { password: _, ...safeUser } = user;
  return safeUser;
}

export const UserService = {
  changePassword,
  updateUser,
};
