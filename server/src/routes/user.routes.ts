import express, { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import {UserController} from '../controllers/user.controller';
import { validate } from '../middlewares/validate';
import {updateUser,changePassword} from '../validations/user.validation';
import { AsyncRequestHandler } from '../types/express.types';

const userRouter:Router = express.Router();

userRouter.get('/me', verifyToken, UserController.getCurrentUser as AsyncRequestHandler);

userRouter.patch(
  '/me',
  verifyToken,
  validate(updateUser),
  UserController.updateCurrentUser as AsyncRequestHandler,
);

userRouter.post(
  '/change-password',
  verifyToken,
  validate(changePassword),
  UserController.changePassword as AsyncRequestHandler,
);

export default userRouter;
