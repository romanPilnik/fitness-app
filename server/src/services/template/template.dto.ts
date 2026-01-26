import type { SplitType, Difficulty, Goal } from '../../types/enums.types.js';
import type { PaginationQuery } from '../../types/api.types.js';

export type TemplateExerciseInputDTO = {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: number;
  targetRir: number;
  notes?: string;
};

export type TemplateExerciseDTO = {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: number;
  targetRir: number;
  notes?: string;
};

export type TemplateWorkoutInputDTO = {
  name: string;
  dayNumber?: number;
  exercises: TemplateExerciseInputDTO[];
};

export type TemplateWorkoutDTO = {
  name: string;
  dayNumber?: number;
  exercises: TemplateExerciseDTO[];
};

export type GetTemplatesInputDTO = {
  filters?: {
    splitType?: SplitType;
    difficulty?: Difficulty;
    goals?: Goal[];
    daysPerWeek?: number;
  };
  pagination?: PaginationQuery;
};

export type GetTemplateByIdInputDTO = {
  templateId: string;
};

export type CreateTemplateInputDTO = {
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
};

export type UpdateTemplateInputDTO = {
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
};

export type DeleteTemplateInputDTO = {
  templateId: string;
};

export type ProgramTemplateDTO = {
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
};

export type ProgramTemplateSummaryDTO = {
  id: string;
  name: string;
  createdBy: string;
  splitType: SplitType;
  daysPerWeek: number;
  description?: string;
  difficulty: Difficulty;
  goals: Goal[];
  workoutCount: number;
};
