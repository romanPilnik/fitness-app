import type { Units, WeekStartsOn, UserRole } from "../../types/enums.types.js";

export interface ChangePasswordInputDTO {
  userId: string;
  oldPassword: string;
  newPassword: string;
}

export interface UpdateUserInputDTO {
  userId: string;
  updates: {
    name?: string;
    preferences?: {
      units?: Units;
      weekStartsOn?: WeekStartsOn;
    };
  };
}

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  preferences: {
    units: Units;
    weekStartsOn: WeekStartsOn;
  };
  role: UserRole;
}
