import { type IUser } from '../../interfaces';
import type { UserDTO } from './user.dto.js';

export function toUserDTO(user: IUser): UserDTO {
  const rawId = (user as { _id?: { toString(): string } })._id;

  return {
    id: rawId ? rawId.toString() : '',
    email: user.email,
    name: user.name,
    preferences: {
      units: user.preferences?.units ?? 'metric',
      weekStartsOn: user.preferences?.weekStartsOn ?? 'sunday',
    },
    role: user.role,
  };
}