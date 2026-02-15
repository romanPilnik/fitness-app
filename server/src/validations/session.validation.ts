import {z} from 'zod';
import {sessionStatusEnum} from './shared.js';

export const getSessions = z.object({});

export const getSessionById = z.object({
  params: z.object({
    sessionId: z.string(),
  }),
});

export const createSession = z.object({
  body: z.object({
    programId: z.string(),
    workoutName: z.string().max(35).trim(),
    dayNumber: z.number().int().min(1).optional(),
    sessionStatus: sessionStatusEnum,
    exercises: z.array(z.any()),
    sessionDuration: z.number().int().min(0).max(600).optional(),
    notes: z.string().max(999).optional(),
  }),
});

export const deleteSession = z.object({
  params: z.object({
    sessionId: z.string(),
  }),
});

export type GetSessionsInput = z.infer<typeof getSessions>;
export type GetSessionByIdInput = z.infer<typeof getSessionById>;
export type CreateSessionInput = z.infer<typeof createSession>;
export type DeleteSessionInput = z.infer<typeof deleteSession>;
