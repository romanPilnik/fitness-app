import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import { ERROR_CODES } from '../types/error.types.js';
import { UserModel } from '../models/User.model.js';
import type { RequestUser } from '../types/express.types.js';

interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

async function verifyToken(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token required', 401, ERROR_CODES.TOKEN_REQUIRED);
    }

    const token = authHeader.substring(7);

    if (!token) {
      throw new AppError('Token required', 401, ERROR_CODES.TOKEN_REQUIRED);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError('Server configuration error', 500, ERROR_CODES.INTERNAL_ERROR);
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, secret, { algorithms: ['HS256'] }) as JwtPayload;
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        throw new AppError('Token expired', 401, ERROR_CODES.TOKEN_EXPIRED);
      }
      if (jwtError instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid token', 401, ERROR_CODES.INVALID_TOKEN);
      }
      throw jwtError;
    }

    if (!decoded.userId) {
      throw new AppError('Invalid token payload', 401, ERROR_CODES.INVALID_TOKEN);
    }

    const user = await UserModel.findById(decoded.userId).select('-password').lean();

    if (!user) {
      throw new AppError('User not found', 401, ERROR_CODES.INVALID_TOKEN);
    }

    if (!user.isActive) {
      throw new AppError('Account deactivated', 401, ERROR_CODES.UNAUTHORIZED_ACCESS);
    }

    req.user = {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      preferences: user.preferences,
      createdAt: user.createdAt ?? new Date(),
      updatedAt: user.updatedAt ?? new Date(),
    };

    next();
  } catch (error) {
    next(error);
  }
}

export { verifyToken };
