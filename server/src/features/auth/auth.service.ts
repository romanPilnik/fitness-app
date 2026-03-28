import { ConflictError, AuthenticationError } from "@/errors/index";
import { ERROR_CODES } from "@/errors/index";
import type { RegisterUserDTO, LoginUserDTO } from "./auth.dtos";
import type { UserModel } from "@/generated/prisma/models";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function register(
  input: RegisterUserDTO,
): Promise<Omit<UserModel, "password">> {
  const { email, password, name } = input;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new ConflictError(
      "User with this email already exists",
      ERROR_CODES.EMAIL_TAKEN,
    );
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });
  const { password: _, ...safeUser } = newUser;
  return safeUser;
}

async function login(
  input: LoginUserDTO,
): Promise<Omit<UserModel, "password">> {
  const { email, password } = input;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AuthenticationError(
      "Invalid email or password",
      ERROR_CODES.INVALID_CREDENTIALS,
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AuthenticationError(
      "Invalid email or password",
      ERROR_CODES.INVALID_CREDENTIALS,
    );
  }
  const { password: _, ...safeUser } = user;

  return safeUser;
}

export const AuthService = {
  register,
  login,
};
