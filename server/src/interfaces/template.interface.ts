import {Types} from 'mongoose';
import { SplitType, Difficulty, Goal } from '../types/enums.types';

export interface ITemplate {
  _id?: string | Types.ObjectId;
  name: string;
  createdBy: string;
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
  description?: string;
  difficulty: Difficulty;
  goals: Goal[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}