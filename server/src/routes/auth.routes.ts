import express from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { register, login } from '../validations/auth.validation';
import type { Router } from 'express';

const authRouter:Router = express.Router();

authRouter.post('/register', validate(register), AuthController.registerUser);

authRouter.post('/login', validate(login), AuthController.loginUser);

export default authRouter;
