import { Types } from 'mongoose';
import { Difficulty, Goal, ProgramSource, ProgramStatus, SplitType } from '../types/enums.types';

export interface IProgram {
  _id?: string | Types.ObjectId;
  userId: string | Types.ObjectId;
  sourceTemplateId?: string | Types.ObjectId;
  sourceTemplateName?: string;
  createdFrom: ProgramSource;
  name: string;
  description?: string;
  difficulty: Difficulty;
  goals: Goal[];
  splitType: SplitType;
  daysPerWeek: number;
  workouts: {
    name: string;
    dayNumber: number;
    exercises: {
      exerciseId: string | Types.ObjectId;
      order: number;
      targetSets: number;
      targetReps: number;
      targetRir: number;
      notes?: string;
    }[];
  }[];
  status: ProgramStatus;
  startDate: Date;
  currentWeek: number;
  nextWorkoutIndex: number;
  lastCompletedWorkoutDate?: Date;
  hasBeenModified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}