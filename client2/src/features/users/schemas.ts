import { z } from 'zod';

const units = z.enum(['metric', 'imperial']);
const weekStartsOn = z.enum(['sunday', 'monday', 'saturday']);

export const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)/;

export const accountProfileSchema = z.object({
  name: z.string().min(2).max(50).trim(),
  units,
  weekStartsOn,
});

export type AccountProfileForm = z.infer<typeof accountProfileSchema>;

const progressionStyle = z.enum(['conservative', 'moderate', 'aggressive']);
const progressionPreference = z.enum(['weight', 'reps', 'balanced']);
const deloadSensitivity = z.enum(['low', 'medium', 'high']);

export const aiPreferencesFormSchema = z.object({
  progressionStyle,
  progressionPreference,
  deloadSensitivity,
  rirFloor: z.number().int().min(0).max(4),
});

export type AiPreferencesForm = z.infer<typeof aiPreferencesFormSchema>;

export const DEFAULT_AI_PREFERENCES_FORM: AiPreferencesForm = {
  progressionStyle: 'moderate',
  progressionPreference: 'balanced',
  deloadSensitivity: 'medium',
  rirFloor: 2,
};

export const changePasswordFormSchema = z
  .object({
    oldPassword: z.string().min(1, 'Required'),
    newPassword: z
      .string()
      .min(8)
      .max(128)
      .regex(passwordRegex, 'Password must contain letters and numbers'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export type ChangePasswordForm = z.infer<typeof changePasswordFormSchema>;
