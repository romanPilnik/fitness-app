import bcrypt from "bcryptjs";
import {
  type CallbackError,
  Document,
  model,
  Schema,
  type PaginateModel,
} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

import {
  UNITS,
  USER_ROLES,
  WEEK_STARTS_ON,
  type Units,
  type UserRole,
  type WeekStartsOn,
} from "../types/enums.types.js";

export interface IUser {
  createdAt?: Date;
  email: string;
  isActive: boolean;
  name: string;
  password: string;
  preferences: {
    units: Units;
    weekStartsOn: WeekStartsOn;
  };
  role: UserRole;
  updatedAt?: Date;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new Schema<UserDocument>(
  {
    email: {
      lowercase: true,
      required: [true, "Email is required"],
      trim: true,
      type: String,
      unique: true,
      validate: {
        message: "Please enter a valid email",
        validator: (v: string) => EMAIL_REGEX.test(v),
      },
    },

    isActive: {
      default: true,
      type: Boolean,
    },

    name: {
      maxlength: [50, "Name cannot exceed 50 characters"],
      minlength: [2, "Name must be at least 2 characters"],
      required: [true, "Name is required"],
      trim: true,
      type: String,
    },

    password: {
      maxlength: [128, "Password length cannot exceed 128 characters"],
      minlength: [8, "Password length must be at least 8 characters"],
      required: [true, "Password is required"],
      select: false,
      type: String,
      validate: {
        message: "Password must contain at least one letter and one number",
        validator: function (this: Document, password: string) {
          if (!this.isModified("password")) {
            return true;
          }
          return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
        },
      },
    },

    preferences: {
      units: {
        default: "metric",
        enum: UNITS,
        type: String,
      },

      weekStartsOn: {
        default: "sunday",
        enum: WEEK_STARTS_ON,
        type: String,
      },
    },

    role: {
      default: "user",
      enum: USER_ROLES,
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ createdAt: -1 });

userSchema.pre(
  "save",
  async function (this: UserDocument, next: (err?: CallbackError) => void) {
    if (!this.isModified("password")) {
      next();
      return;
    }
    try {
      if (this.password) {
        this.password = await bcrypt.hash(this.password, 12);
      }
      next();
    } catch (error) {
      next(error as CallbackError);
    }
  },
);

userSchema.plugin(mongoosePaginate);

export interface UserDocument extends IUser, Document {}

export const UserModel = model<UserDocument, PaginateModel<UserDocument>>(
  "User",
  userSchema,
  "User",
);
