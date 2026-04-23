import type { Request, Response, NextFunction } from "express";
import { AuthenticationError, AuthorizationError } from "../errors/index";
import { ERROR_CODES } from "../types/error.types";
import { Role } from "../generated/prisma/enums";

function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AuthenticationError(
          "Authentication required",
          ERROR_CODES.UNAUTHENTICATED,
        );
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new AuthorizationError(
          "Insufficient permissions",
          ERROR_CODES.INSUFFICIENT_PERMISSIONS,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export { requireRole };
