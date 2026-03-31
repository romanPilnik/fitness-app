import { z } from "zod";
import { passwordRegex } from "@/features/auth/auth.validation.js";
import { Units, WeekStartsOn } from "@/generated/prisma/enums";

export const updateUser = z.object({
  body: z
    .object({
      name: z.string().min(2).max(50).trim().optional(),
      units: z.enum(Units).optional(),
      weekStartsOn: z.enum(WeekStartsOn).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    }),
});

export const changePassword = z.object({
  body: z.object({
    oldPassword: z.string(),
    newPassword: z
      .string()
      .min(8)
      .max(128)
      .regex(passwordRegex, "Password must contain letters and numbers"),
  }),
});

export type UpdateUserBody = z.infer<typeof updateUser>["body"];
export type ChangePasswordBody = z.infer<typeof changePassword>["body"];
