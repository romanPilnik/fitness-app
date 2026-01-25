import { type User } from '../../models/User.model.js';
import type { UserDTO } from './user.dto.js';

export function toUserDTO(user: User): UserDTO {
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