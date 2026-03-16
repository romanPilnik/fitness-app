import type { Role, Units, WeekStartsOn } from "../generated/prisma/enums";

export interface RequestUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  units: Units;
  weekStartsOn: WeekStartsOn;
  createdAt: Date;
  updatedAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}
