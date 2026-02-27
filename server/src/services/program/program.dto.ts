import type {
  SplitType,
  Difficulty,
  Goal,
  ProgramStatus,
  ProgramSource,
} from "../../types/enums.types.js";
import type { PaginationQuery } from "../../types/api.types.js";

export interface ProgramExerciseInputDTO {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: number;
  targetRir: number;
  notes?: string;
}

export interface ProgramExerciseDTO {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: number;
  targetRir: number;
  notes?: string;
}

export interface WorkoutInputDTO {
  name: string;
  dayNumber?: number;
  exercises: ProgramExerciseInputDTO[];
}

export interface WorkoutDTO {
  name: string;
  dayNumber?: number;
  exercises: ProgramExerciseDTO[];
}

export interface GetProgramsInputDTO {
  userId: string;
  filters?: {
    status?: ProgramStatus;
  };
  pagination?: PaginationQuery;
}

export interface GetProgramByIdInputDTO {
  programId: string;
  userId: string;
}

export interface GetActiveProgramInputDTO {
  userId: string;
}

export interface CreateFromTemplateInputDTO {
  userId: string;
  templateId: string;
  startDate?: Date;
  customizations?: {
    name?: string;
    workouts?: Partial<WorkoutInputDTO>[];
  };
}

export interface CreateCustomProgramInputDTO {
  userId: string;
  name: string;
  description?: string;
  difficulty: Difficulty;
  goals?: Goal[];
  splitType: SplitType;
  daysPerWeek: number;
  workouts: WorkoutInputDTO[];
  startDate?: Date;
}

export interface UpdateProgramInputDTO {
  programId: string;
  userId: string;
  updates: {
    name?: string;
    description?: string;
    status?: ProgramStatus;
    startDate?: Date;
    workouts?: WorkoutInputDTO[];
  };
}

export interface DeleteProgramInputDTO {
  programId: string;
  userId: string;
}

export interface UpdateProgressInputDTO {
  programId: string;
  userId: string;
}

export interface ProgramDTO {
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
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgramSummaryDTO {
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
}
