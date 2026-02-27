import type { UserRole, WeekStartsOn, Units } from "../../types/enums.types.js";

export interface RegisterInputDTO {
  email: string;
  password: string;
  name: string;
}

export interface LoginInputDTO {
  email: string;
  password: string;
}

export interface AuthUserDTO {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  preferences: {
    units: Units;
    weekStartsOn: WeekStartsOn;
  };
}
