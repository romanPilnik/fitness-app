import { AppError } from "../../errors/AppError";
import { ERROR_CODES } from "../../types/error.types";
import bcrypt from "bcryptjs";
import type { ChangePasswordDTO, UpdateUserDTO } from "./user.dtos";
import { prisma } from "../../lib/prisma";
import type { UserModel } from "../../generated/prisma/models";

async function changePassword(input: ChangePasswordDTO): Promise<void> {
  const { id, oldPassword, newPassword } = input;

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND);
  }
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new AppError(
      "Incorrect old password",
      401,
      ERROR_CODES.INVALID_CREDENTIALS,
    );
  }

  if (newPassword === oldPassword) {
    throw new AppError(
      "New password must be different from the old password",
      400,
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
