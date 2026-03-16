import type { Request, Response } from "express";
import type {
  RegisterUserBody,
  LoginUserBody,
} from "../validations/auth.validation";
import { AuthService } from "../services/auth/auth.service";
import { sendSuccess } from "../utils/response";
import generateAuthToken from "../services/auth/auth.helpers";

async function registerUser(
  req: Request<object, object, RegisterUserBody>,
  res: Response,
) {
  const { email, password, name } = req.body;
  const user = await AuthService.register({ email, password, name });
  const token = generateAuthToken(user.id);
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
    "User created successfully",
  );
}

async function loginUser(
  req: Request<object, object, LoginUserBody>,
  res: Response,
) {
  const { email, password } = req.body;
  const user = await AuthService.login({ email, password });
  const token = generateAuthToken(user.id);

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
    "User logged in successfully",
  );
}

export const AuthController = {
  registerUser,
  loginUser,
};
