import { Types } from 'mongoose';
import { Units,WeekStartsOn,UserRole } from '../types/enums.types';

export interface IUser {
  _id?: string | Types.ObjectId;
  email: string;
  password: string;
  name: string;
  preferences: {
    units: Units,
    weekStartsOn: WeekStartsOn,
  }
  role: UserRole;
  isActive: boolean;
  createdAt?: Date,
  updatedAt?: Date,
}