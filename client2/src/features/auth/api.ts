import { postEnvelope } from '@/api/client';
import type { AuthSession, LoginBody, RegisterBody } from './types';

export function loginRequest(body: LoginBody): Promise<AuthSession> {
  return postEnvelope<AuthSession>('/auth/login', body);
}

export function registerRequest(body: RegisterBody): Promise<AuthSession> {
  return postEnvelope<AuthSession>('/auth/register', body);
}
