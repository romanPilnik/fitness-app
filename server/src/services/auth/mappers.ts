import type { UserRole, WeekStartsOn, Units } from '../../types/enums.types';
import type { User } from '../../models/User.model.js';

export type RegisterInputDTO = {
  email: string;
  password: string;
  name: string;
};

export type UserDTO = {
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

export function toUserDTO(user: User): UserDTO {
  const rawId = (user as { _id?: { toString(): string } })._id;
  return {
    id: rawId ? rawId.toString() : '',
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    preferences: {
      units: user.preferences?.units ?? 'metric',
      weekStartsOn: user.preferences?.weekStartsOn ?? 'monday',
    },
  };
}
