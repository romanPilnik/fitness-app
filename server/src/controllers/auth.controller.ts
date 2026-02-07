import type { Response } from 'express';
import type { RequestWithBody } from '../types/express.types';
import type { LoginUserInput, RegisterUserInput } from '../validations/auth.validation';
import { AuthService } from '../services/auth/auth.service';
import { sendSuccess } from '../utils/response';

type RegisterBody = RegisterUserInput['body'];
type LoginBody = LoginUserInput['body'];

async function registerUser (req: RequestWithBody<RegisterBody>, res: Response){
  const { email, password, name } = req.body;
  const user = await AuthService.register({email, password, name});
  const token = AuthService.generateAuthToken(user.id);
  return sendSuccess(
    res,
    {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    },
    201,
    'User created successfully',
  );
};

async function loginUser (req: RequestWithBody<LoginBody>, res: Response) {
  const { email, password } = req.body;
  const user = await AuthService.login({ email, password });
  const token = AuthService.generateAuthToken(user.id);

  return sendSuccess(
    res,
    {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    },
    200,
    'User logged in successfully',
  );
};

export const AuthController = {
  registerUser,
  loginUser,
};
