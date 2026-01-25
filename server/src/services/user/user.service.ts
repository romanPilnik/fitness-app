import { UserModel } from '../../models/User.model.js';
import { AppError } from '../../errors/AppError.js';
import { ERROR_CODES } from '../../types/error.types.js';
import type {
  ChangePasswordInputDTO,
  UpdateUserInputDTO,
  UserDTO,
} from './user.dto.js';
import { toUserDTO } from './user.mapper.js';

async function changePassword(input: ChangePasswordInputDTO): Promise<void> {
  const { userId, oldPassword, newPassword } = input;

  const user = await UserModel.findById(userId).select('+password');

  if (!user) {
    throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND);
  }

  if (!(await user.comparePassword(oldPassword))) {
    throw new AppError('Current password is incorrect', 401, ERROR_CODES.INVALID_CREDENTIALS);
  }

  if (!newPassword) {
    throw new AppError('New password must be provided', 400, ERROR_CODES.INVALID_INPUT);
  }

  if (newPassword === oldPassword) {
    throw new AppError('New password must be different from the old password', 400, ERROR_CODES.INVALID_INPUT);
  }

  user.password = newPassword;
  await user.save();
}

async function updateUser(input: UpdateUserInputDTO): Promise<UserDTO> {
  const { userId, profileUpdates } = input;

  if (!profileUpdates || Object.keys(profileUpdates).length === 0) {
    throw new AppError('No fields to update', 400, ERROR_CODES.INVALID_INPUT);
  }

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $set: profileUpdates },
    { new: true, runValidators: true },
  ).select('-password -__v');

  if (!user) {
    throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND);
  }

  return toUserDTO(user);
}

export const UserService = {
  changePassword,
  updateUser,
};