import type { SplitType, Difficulty, Goal } from "../../types/enums.types.js";
import type { PaginationQuery } from "../../types/api.types.js";

export interface TemplateExerciseInputDTO {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: number;
  targetRir: number;
  notes?: string;
}

export interface TemplateExerciseDTO {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: number;
  targetRir: number;
  notes?: string;
}

export interface TemplateWorkoutInputDTO {
  name: string;
  dayNumber?: number;
  exercises: TemplateExerciseInputDTO[];
}

export interface TemplateWorkoutDTO {
  name: string;
  dayNumber?: number;
  exercises: TemplateExerciseDTO[];
}

export interface GetTemplatesInputDTO {
  filters?: {
    splitType?: SplitType;
    difficulty?: Difficulty;
    goals?: Goal[];
    daysPerWeek?: number;
  };
  pagination?: PaginationQuery;
}

export interface GetTemplateByIdInputDTO {
  templateId: string;
}

export interface CreateTemplateInputDTO {
  templateData: {
    name: string;
    createdBy: string;
    splitType: SplitType;
    daysPerWeek: number;
    description?: string;
    difficulty: Difficulty;
    goals?: Goal[];
    workouts: TemplateWorkoutInputDTO[];
  };
}

export interface UpdateTemplateInputDTO {
  templateId: string;
  updates: {
    name?: string;
    description?: string;
    difficulty?: Difficulty;
    goals?: Goal[];
    workouts?: TemplateWorkoutInputDTO[];
    daysPerWeek?: number;
    splitType?: SplitType;
  };
}

export interface DeleteTemplateInputDTO {
  templateId: string;
}

export interface ProgramTemplateDTO {
  id: string;
  name: string;
  createdBy: string;
  splitType: SplitType;
  daysPerWeek: number;
  description?: string;
  difficulty: Difficulty;
  goals: Goal[];
  workouts: TemplateWorkoutDTO[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgramTemplateSummaryDTO {
  id: string;
  name: string;
  createdBy: string;
  splitType: SplitType;
  daysPerWeek: number;
  description?: string;
  difficulty: Difficulty;
  goals: Goal[];
  workoutCount: number;
}
