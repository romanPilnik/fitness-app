import {
  Difficulty,
  Goal,
  SplitType,
  ProgramSources,
  ProgramStatuses,
} from "../../generated/prisma/enums";
import type { CursorPaginationParams } from "../../lib/pagination";

interface ProgramWorkoutExerciseDTO {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetWeight?: number;
  targetTotalReps?: number;
  targetTopSetReps?: number;
  targetRir?: number;
}

interface ProgramWorkoutDTO {
  name: string;
  dayNumber: number;
  exercises: ProgramWorkoutExerciseDTO[];
}

export interface GetProgramsDTO extends CursorPaginationParams {
  userId: string;
  status?: ProgramStatuses;
  difficulty?: Difficulty;
  goal?: Goal;
  splitType?: SplitType;
  createdFrom?: ProgramSources;
}

export interface GetActiveProgramDTO {
  userId: string;
}

export interface GetProgramByIdDTO {
  programId: string;
  userId: string;
}

export interface CreateFromTemplateDTO {
  userId: string;
  templateId: string;
  name?: string;
  startDate?: string;
}

export interface CreateCustomProgramDTO {
  userId: string;
  name: string;
  description?: string;
  difficulty: Difficulty;
  goal: Goal;
  splitType: SplitType;
  daysPerWeek: number;
  startDate?: string;
  workouts: ProgramWorkoutDTO[];
}

export interface UpdateProgramDTO {
  programId: string;
  userId: string;
  name?: string;
  description?: string;
  difficulty?: Difficulty;
  goal?: Goal;
  splitType?: SplitType;
  daysPerWeek?: number;
  status?: ProgramStatuses;
  startDate?: string;
}

export interface DeleteProgramDTO {
  programId: string;
  userId: string;
}

export interface AddProgramWorkoutDTO {
  programId: string;
  userId: string;
  name: string;
  dayNumber: number;
}

export interface UpdateProgramWorkoutDTO {
  programId: string;
  workoutId: string;
  userId: string;
  name?: string;
  dayNumber?: number;
}

export interface DeleteProgramWorkoutDTO {
  programId: string;
  workoutId: string;
  userId: string;
}

export interface AddWorkoutExerciseDTO {
  programId: string;
  workoutId: string;
  userId: string;
  exerciseId: string;
  order: number;
  targetSets: number;
  targetWeight?: number;
  targetTotalReps?: number;
  targetTopSetReps?: number;
  targetRir?: number;
}

export interface UpdateWorkoutExerciseDTO {
  programId: string;
  workoutId: string;
  workoutExerciseId: string;
  userId: string;
  order?: number;
  targetSets?: number;
  targetWeight?: number;
  targetTotalReps?: number;
  targetTopSetReps?: number;
  targetRir?: number;
}

export interface DeleteWorkoutExerciseDTO {
  programId: string;
  workoutId: string;
  workoutExerciseId: string;
  userId: string;
}

export interface BulkReorderWorkoutExercisesDTO {
  programId: string;
  workoutId: string;
  userId: string;
  exercises: { id: string; order: number }[];
}
