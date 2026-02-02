import {Types} from 'mongoose';

export interface IExerciseStats{
  _id?: string | Types.ObjectId;
  userId: string | Types.ObjectId;
  exerciseId: string | Types.ObjectId;

  lastPerformed?: {
    date: Date;
    weight: number;
    reps: number;
    sets: number;
  };

  personalRecord?: {
    weight: number;
    reps: number;
    date: Date;
  };

  recentSessions: {
    date: Date;
    topSetWeight: number;
    topSetReps: number;
    totalSets: number;
    sessionId: string | Types.ObjectId;
  }[];

  metrics: {
    avgDaysBetweenSessions?: number;
    totalSessions: number;
  };

  difficultyRating?: number;
  enjoymentRating?: number;
  formNotes?: string;
  injuryNotes?: string;
  isActive: boolean;
  isFavorite: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // virtuals
  daysSinceLastPerformed?: number;
  volumeLastSession?: number;
}