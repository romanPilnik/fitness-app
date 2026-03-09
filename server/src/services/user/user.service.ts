import { UserModel } from "../../models/User.model";
import { AppError } from "../../errors/AppError";
import { ERROR_CODES } from "../../types/error.types";
import type {
  ChangePasswordInputDTO,
  UpdateUserInputDTO,
  UserDTO,
} from "./user.dto";
import { toUserDTO } from "./user.mapper";
import bcrypt from "bcryptjs";

async function changePassword(input: ChangePasswordInputDTO): Promise<void> {
  const { userId, oldPassword, newPassword } = input;

  const user = await UserModel.findById(userId).select("+password");

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

  user.password = newPassword;
  await user.save();
}

async function updateUser(input: UpdateUserInputDTO): Promise<UserDTO> {
  const { userId, updates } = input;

  if (Object.keys(updates).length === 0) {
    throw new AppError("No fields to update", 400, ERROR_CODES.INVALID_INPUT);
  }

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true },
  ).select("-password -__v");

  if (!user) {
    throw new AppError("User not found", 404, ERROR_CODES.NOT_FOUND);
  }

  return toUserDTO(user);
}

export const UserService = {
  changePassword,
  updateUser,
};
