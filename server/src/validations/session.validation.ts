import {z} from 'zod';
import {sessionStatusEnum} from './shared.js';

// GET /api/v1/sessions/ - No validation needed
export const getSessions = z.object({});

// GET /api/v1/sessions/:sessionId
export const getSessionById = z.object({
  params: z.object({
    sessionId: z.string(),
  }),
});

// POST /api/v1/sessions/create
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

// DELETE /api/v1/sessions/:sessionId
export const deleteSession = z.object({
  params: z.object({
    sessionId: z.string(),
  }),
});

// Export inferred types
export type GetSessionsInput = z.infer<typeof getSessions>;
export type GetSessionByIdInput = z.infer<typeof getSessionById>;
export type CreateSessionInput = z.infer<typeof createSession>;
export type DeleteSessionInput = z.infer<typeof deleteSession>;
