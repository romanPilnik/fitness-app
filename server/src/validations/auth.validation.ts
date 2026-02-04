import {z} from 'zod';
import {passwordRegex} from './shared.js';

export const loginUser = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

export const registerUser = z.object({
  body: z.object({
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .max(128)
      .regex(passwordRegex, 'Password must contain letters and numbers'),
    name: z.string().min(2).max(50),
  }),
});

// Export inferred types
export type LoginUserInput = z.infer<typeof loginUser>;
export type RegisterUserInput = z.infer<typeof registerUser>;
