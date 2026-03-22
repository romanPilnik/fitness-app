import {
  SplitType,
  Difficulty,
  Goal,
  Role,
} from "../../generated/prisma/enums";
import type { CursorPaginationParams } from "../../lib/pagination";

export interface GetTemplatesDTO extends CursorPaginationParams {
  splitType?: SplitType;
  difficulty?: Difficulty;
  daysPerWeek?: number;
  userId?: string;
  myTemplatesOnly?: boolean;
}

export interface GetTemplateByIdDTO {
  id: string;
}

export interface CreateTemplateDTO {
  name: string;
  description?: string;
  daysPerWeek: number;
  difficulty: Difficulty;
  splitType: SplitType;
  goal: Goal;
  workouts: {
    name: string;
    dayNumber: number;
    exercises: {
      exerciseId: string;
      order: number;
      notes?: string;
    }[];
  }[];
  createdByUserId: string | null;
}

export interface UpdateTemplateDTO {
  templateId: string;
  userId: string;
  name?: string;
  description?: string;
  daysPerWeek?: number;
  difficulty?: Difficulty;
  splitType?: SplitType;
  goal?: Goal;
  workouts?: {
    name: string;
    dayNumber: number;
    exercises: {
      exerciseId: string;
      order: number;
      notes?: string;
    }[];
  }[];
  userRole: Role;
}

export interface DeleteTemplateDTO {
  templateId: string;
  userId: string;
  userRole: Role;
}
