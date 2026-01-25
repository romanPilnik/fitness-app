import type { User } from '../../models/User.model.js';
import type { AuthUserDTO } from './auth.dto.js';

export function toAuthUserDTO(user: User): AuthUserDTO {
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