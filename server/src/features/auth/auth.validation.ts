import * as z from "zod";

export const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)/;

export const loginSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string(),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z
      .string()
      .min(8)
      .max(128)
      .regex(passwordRegex, "Password must contain letters and numbers"),
    name: z.string().min(2).max(50),
  }),
});

export type LoginUserBody = z.infer<typeof loginSchema>["body"];
export type RegisterUserBody = z.infer<typeof registerSchema>["body"];
