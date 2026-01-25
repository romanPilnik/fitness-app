import type { Units, WeekStartsOn, UserRole } from '../../types/enums.types.js';

export type ChangePasswordInputDTO = {
  userId: string;
  oldPassword: string;
  newPassword: string;
};

export type UpdateUserInputDTO = {
  userId: string;
  profileUpdates: {
    name?: string;
    preferences?: {
      units?: Units;
      weekStartsOn?: WeekStartsOn;
    };
  };
};

export type UserDTO = {
  id: string;
  email: string;
  name: string;
  preferences: {
    units: Units;
    weekStartsOn: WeekStartsOn;
  };
  role: UserRole;
};