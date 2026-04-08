import { z } from 'zod';

const passwordLettersAndNumbers = /^(?=.*[A-Za-z])(?=.*\d)/;

export const loginSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .max(128, 'At most 128 characters')
    .regex(passwordLettersAndNumbers, 'Password must contain letters and numbers'),
  name: z.string().min(2, 'At least 2 characters').max(50, 'At most 50 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
