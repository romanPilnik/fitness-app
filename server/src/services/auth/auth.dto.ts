import type { UserRole, WeekStartsOn, Units } from '../../types/enums.types.js';

export type RegisterInputDTO = {
  email: string;
  password: string;
  name: string;
};

export type LoginInputDTO = {
  email: string;
  password: string;
};

export type AuthUserDTO = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  preferences: {
    units: Units;
    weekStartsOn: WeekStartsOn;
  };
};