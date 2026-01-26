import type {
  SplitType,
  Difficulty,
  Goal,
  ProgramStatus,
  ProgramSource,
} from '../../types/enums.types.js';
import type { PaginationQuery } from '../../types/api.types.js';

export type ProgramExerciseInputDTO = {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: number;
  targetRir: number;
  notes?: string;
};

export type ProgramExerciseDTO = {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: number;
  targetRir: number;
  notes?: string;
};

export type WorkoutInputDTO = {
  name: string;
  dayNumber?: number;
  exercises: ProgramExerciseInputDTO[];
};

export type WorkoutDTO = {
  name: string;
  dayNumber?: number;
  exercises: ProgramExerciseDTO[];
};

export type GetProgramsInputDTO = {
  userId: string;
  filters?: {
    status?: ProgramStatus;
  };
  pagination?: PaginationQuery;
};

export type GetProgramByIdInputDTO = {
  programId: string;
  userId: string;
};

export type GetActiveProgramInputDTO = {
  userId: string;
};

export type CreateFromTemplateInputDTO = {
  userId: string;
  templateId: string;
  startDate?: Date;
  customizations?: {
    name?: string;
    workouts?: Partial<WorkoutInputDTO>[];
  };
};

export type CreateCustomProgramInputDTO = {
  userId: string;
  name: string;
  description?: string;
  difficulty: Difficulty;
  goals?: Goal[];
  splitType: SplitType;
  daysPerWeek: number;
  workouts: WorkoutInputDTO[];
  startDate?: Date;
};

export type UpdateProgramInputDTO = {
  programId: string;
  userId: string;
  updates: {
    name?: string;
    description?: string;
    status?: ProgramStatus;
    startDate?: Date;
    workouts?: WorkoutInputDTO[];
  };
};

export type DeleteProgramInputDTO = {
  programId: string;
  userId: string;
};

export type ProgramDTO = {
  id: string;
  userId: string;
  sourceTemplateId?: string;
  sourceTemplateName?: string;
  createdFrom: ProgramSource;
  name: string;
  description?: string;
  difficulty: Difficulty;
  goals: Goal[];
  splitType: SplitType;
  daysPerWeek: number;
  workouts: WorkoutDTO[];
  status: ProgramStatus;
  startDate: Date;
  currentWeek: number;
  nextWorkoutIndex: number;
  lastCompletedWorkoutDate?: Date;
  hasBeenModified: boolean;
  lastModified?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type ProgramSummaryDTO = {
  id: string;
  name: string;
  description?: string;
  difficulty: Difficulty;
  goals: Goal[];
  splitType: SplitType;
  daysPerWeek: number;
  status: ProgramStatus;
  currentWeek: number;
  createdAt: Date;
};
