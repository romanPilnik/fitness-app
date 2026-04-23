import { getEnvelope, patchEnvelope } from '@/api/client';
import type { AiUserPreferences, UserProfile } from './types';

export const userQueryKeys = {
  me: () => ['users', 'me'] as const,
  aiPreferences: () => ['users', 'me', 'ai-preferences'] as const,
};

export type PatchUserBody = Partial<{
  name: string;
  units: 'metric' | 'imperial';
  weekStartsOn: 'sunday' | 'monday' | 'saturday';
}>;

export async function fetchCurrentUser(): Promise<UserProfile> {
  return getEnvelope<UserProfile>('/users/me');
}

export async function patchCurrentUser(body: PatchUserBody): Promise<UserProfile> {
  return patchEnvelope<UserProfile>('/users/me', body);
}

export async function fetchAiPreferences(): Promise<AiUserPreferences> {
  return getEnvelope<AiUserPreferences>('/users/me/ai-preferences');
}

export async function patchAiPreferences(
  body: Partial<AiUserPreferences>,
): Promise<AiUserPreferences> {
  return patchEnvelope<AiUserPreferences>('/users/me/ai-preferences', body);
}
