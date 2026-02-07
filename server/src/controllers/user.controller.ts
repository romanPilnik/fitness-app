import { sendSuccess } from '../utils/response';
import { UserService } from '../services/user/user.service';
import type { AuthenticatedRequest, AuthenticatedRequestWithBody } from '../types/express.types';
import type { Response } from 'express';
import type { UpdateUserInput,ChangePasswordInput } from '../validations/user.validation';

type UpdateUserBody = UpdateUserInput['body'];
type ChangePasswordBody = ChangePasswordInput['body'];

// Doesnt use DTO, consider changing in the future
async function getCurrentUser (req: AuthenticatedRequest, res: Response){
  return sendSuccess(res, req.user, 200, 'User retrieved');
};

async function updateCurrentUser (req: AuthenticatedRequestWithBody<UpdateUserBody>, res: Response) {
  const allowedUpdates = ['name', 'preferences.units', 'preferences.weekStartsOn'];
  const updates: Partial<UpdateUserBody> = {};

  if(updates.name) updates.name = req.body.name;
  if(req.body.preferences) {
    updates.preferences = {};
    if(req.body.preferences.units) updates.preferences.units = req.body.preferences.units;
    if(req.body.preferences.weekStartsOn) updates.preferences.weekStartsOn = req.body.preferences.weekStartsOn;
  }
  const userId = req.user.id;
  const user = await UserService.updateUser({ userId: userId, updates });
  return sendSuccess(res, user, 200, 'User updated');
};

async function changePassword (req: AuthenticatedRequestWithBody<ChangePasswordBody>, res: Response) {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;
  await UserService.changePassword({ userId, oldPassword, newPassword });
  sendSuccess(res, null, 200, 'Password changed successfully');
};

export const UserController = {
  getCurrentUser,
  updateCurrentUser,
  changePassword,
};