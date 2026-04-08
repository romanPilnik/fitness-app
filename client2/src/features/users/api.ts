import { getEnvelope, patchEnvelope, postEnvelope } from '@/api/client';
import type { UserProfile } from './types';

export const userQueryKeys = {
  me: () => ['users', 'me'] as const,
};

export type PatchUserBody = Partial<{
  name: string;
  units: 'metric' | 'imperial';
  weekStartsOn: 'sunday' | 'monday' | 'saturday';
}>;

export type ChangePasswordBody = {
  oldPassword: string;
  newPassword: string;
};

export async function fetchCurrentUser(): Promise<UserProfile> {
  return getEnvelope<UserProfile>('/users/me');
}

export async function patchCurrentUser(body: PatchUserBody): Promise<UserProfile> {
  return patchEnvelope<UserProfile>('/users/me', body);
}

export async function changePassword(body: ChangePasswordBody): Promise<void> {
  await postEnvelope<null>('/users/change-password', body);
}
