import { UserModel } from '../../models/User.model.js';
import { AppError } from '../../errors/AppError.js';
import { ERROR_CODES } from '../../errors/index.js';
import jwt from 'jsonwebtoken';
import type { RegisterInputDTO, LoginInputDTO, AuthUserDTO } from './auth.dto.js';
import { toAuthUserDTO } from './auth.mapper.js';

async function register(input: RegisterInputDTO): Promise<AuthUserDTO> {
  const { email, password, name } = input;

  const existingUser = await UserModel.findOne({ email });

  if (existingUser) {
    throw new AppError('User with this email already exists', 409, ERROR_CODES.DUPLICATE_VALUE);
  }

  const newUser = new UserModel({
    email,
    password,
    name,
  });
  const savedUser = await newUser.save();
  return toAuthUserDTO(savedUser);
}

async function login(input: LoginInputDTO): Promise<AuthUserDTO> {
  const { email, password } = input;

  const user = await UserModel.findOne({ email }).select('+password');

  if (!user) {
    throw new AppError('Invalid email or password', 401, ERROR_CODES.INVALID_CREDENTIALS);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401, ERROR_CODES.INVALID_CREDENTIALS);
  }

  return toAuthUserDTO(user);
}

function generateAuthToken(userId: string): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AppError('Server configuration error', 500, ERROR_CODES.INTERNAL_ERROR);
  }

  return jwt.sign(
    { userId },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
      algorithm: 'HS256',
    },
  );
}

export const AuthService = {
  register,
  login,
  generateAuthToken,
};
