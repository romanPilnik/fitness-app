import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";
import { AppError } from "../errors/AppError";
import { ERROR_CODES } from "../types/error.types";
import type { Role, Units, WeekStartsOn } from "../generated/prisma/enums";

export async function verifySession(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      throw new AppError(
        "Authentication required",
        401,
        ERROR_CODES.UNAUTHENTICATED,
      );
    }

    const { user } = session;

    if (user.isActive === false) {
      throw new AppError(
        "Account deactivated",
        401,
        ERROR_CODES.UNAUTHORIZED_ACCESS,
      );
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      isActive: user.isActive ?? true,
      units: user.units as Units,
      weekStartsOn: user.weekStartsOn as WeekStartsOn,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
    };

    next();
  } catch (error) {
    next(error);
  }
}
