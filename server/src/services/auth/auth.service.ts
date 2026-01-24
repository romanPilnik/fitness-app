import { UserModel } from '../../models/User.model';
import { AppError } from '../../errors/AppError.js';
import { ERROR_CODES } from '../../errors';
import { toUserDTO } from './mappers';

// Consider using single object parameter for inputs if more fields are added in future
async function registerUser(email: string, password: string, name: string) {
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
  return toUserDTO(savedUser);
}

async function loginUser(email: string, password: string) {
  const user = await UserModel.findOne({ email }).select('+password');

  if (!user) {
    throw new AppError('Invalid email or password', 401, ERROR_CODES.INVALID_CREDENTIALS);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401, ERROR_CODES.INVALID_CREDENTIALS);
  }
  return toUserDTO(user);
}

/*
const generateAuthToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};
*/
export const AuthService = {
  registerUser,
  loginUser,
};
