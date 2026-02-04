import {z} from 'zod';
import {passwordRegex, unitsEnum, weekStartsOnEnum} from './shared.js';

// PATCH /api/users/me
export const updateUser = z.object({
  body: z
    .object({
      name: z.string().min(2).max(50).trim().optional(),
      preferences: z
        .object({
          units: unitsEnum.optional(),
          weekStartsOn: weekStartsOnEnum.optional(),
        })
        .optional(),
    })
    .refine(data => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

// POST /api/users/change-password
export const changePassword = z.object({
  body: z.object({
    oldPassword: z.string(),
    newPassword: z
      .string()
      .min(8)
      .max(128)
      .regex(passwordRegex, 'Password must contain letters and numbers'),
  }),
});

// Export inferred types
export type UpdateUserInput = z.infer<typeof updateUser>;
export type ChangePasswordInput = z.infer<typeof changePassword>;
