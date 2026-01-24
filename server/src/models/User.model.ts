import mongoose, { Schema } from 'mongoose';
import type {
  InferSchemaType,
  Model,
  CallbackWithoutResultAndOptionalError,
  PaginateModel,
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import { USER_ROLES, UNITS, WEEK_STARTS_ON } from '../types/enums.types.js';

interface IUserMethods {
  comparePassword(_candidatePassword: string): Promise<boolean>;
}

interface IUserModel extends Model<User, object, IUserMethods> {
  findActive(): ReturnType<typeof mongoose.Model.find>;
}

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      unique: true,
      validate: {
        validator: (v: string) => validator.isEmail(v),
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
        validator: function (this: { isModified: (_path: string) => boolean }, password: string) {
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
        default: 'monday',
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

userSchema.pre('save', async function (next: CallbackWithoutResultAndOptionalError) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

userSchema.plugin(mongoosePaginate);

export type User = InferSchemaType<typeof userSchema>;

export const UserModel = mongoose.model<User, IUserModel & PaginateModel<User>>('User', userSchema);
