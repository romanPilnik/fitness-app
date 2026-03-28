import type { Units, WeekStartsOn } from "@/generated/prisma/enums";

export interface ChangePasswordDTO {
  id: string;
  oldPassword: string;
  newPassword: string;
}

export interface UpdateUserDTO {
  id: string;
  name?: string;
  units?: Units;
  weekStartsOn?: WeekStartsOn;
}
