import { Types } from 'mongoose';
import { SessionStatus, SetType } from '../types/enums.types';

export interface ISession {
  _id?: string | Types.ObjectId;
  userId: string | Types.ObjectId;
  programId: string | Types.ObjectId;
  workoutName: string;
  dayNumber?: number;
  sessionStatus: SessionStatus;
  exercises: {
    exerciseId: string | Types.ObjectId;
    order: number;
    sets: {
      setType: SetType;
      reps: number;
      weight: number;
      rir: number;
      setCompleted: boolean;
    }[];
    notes?: string;
  }[];
  datePerformed: Date;
  sessionDuration?: number;
  notes?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}