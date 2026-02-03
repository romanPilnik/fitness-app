import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import { ERROR_CODES } from '../types/error.types.js';
import type { UserRole } from '../types/enums.types.js';

function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, ERROR_CODES.TOKEN_REQUIRED);
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new AppError('Insufficient permissions', 403, ERROR_CODES.INSUFFICIENT_PERMISSIONS);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export { requireRole };
