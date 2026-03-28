import jwt from "jsonwebtoken";
import { AppError, ERROR_CODES } from "@/errors";

export default function generateAuthToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  const expiresIn: jwt.SignOptions["expiresIn"] =
    (process.env.JWT_EXPIRE as jwt.SignOptions["expiresIn"]) ?? "7d";

  if (!secret) {
    throw new AppError(
      "Server configuration error",
      500,
      ERROR_CODES.INTERNAL_ERROR,
    );
  }

  return jwt.sign({ userId }, secret, {
    expiresIn,
    algorithm: "HS256",
  });
}
