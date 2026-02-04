import { Schema,model,HydratedDocument,PaginateModel, CallbackError } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import bcrypt from 'bcryptjs';
import { IUser } from '../interfaces';
import { USER_ROLES, UNITS, WEEK_STARTS_ON } from '../types/enums.types.js';
import { Document } from 'mongodb';

// Email validation regex (RFC 5322 simplified)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface UserModelType extends PaginateModel<UserDocument>{
  findActive(): Promise<UserDocument[]>;
}

export type UserDocument = HydratedDocument<IUser, IUserMethods>;

const userSchema = new Schema<IUser, UserModelType, IUserMethods>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      unique: true,
      validate: {
        validator: (v: string) => EMAIL_REGEX.test(v),
        message: 'Please enter a valid email',
      },
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password length must be at least 8 characters'],
      maxlength: [128, 'Password length cannot exceed 128 characters'],
      select: false,
      validate: {
        validator: function (this: Document, password: string) {
          if (!this.isModified('password')) {
            return true;
          }
          return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
        },
        message: 'Password must contain at least one letter and one number',
      },
    },

    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    preferences: {
      units: {
        type: String,
        enum: UNITS,
        default: 'metric',
      },

      weekStartsOn: {
        type: String,
        enum: WEEK_STARTS_ON,
        default: 'sunday',
      },
    },

    role: {
      type: String,
      enum: USER_ROLES,
      default: 'user',
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.index({ createdAt: -1 });

userSchema.pre('save', async function (this:UserDocument, next:(err?:CallbackError)=>void) {
  if (!this.isModified('password')) {
    return next();
  }
  try{
    if(this.password){
      this.password = await bcrypt.hash(this.password, 12);
    }
    next();
  }catch(error){
    next(error as CallbackError);
  }
 
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

userSchema.plugin(mongoosePaginate as any);

export const UserModel = model<IUser,UserModelType>('User', userSchema);