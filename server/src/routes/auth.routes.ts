import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema } from "../validations/auth.validation";
import { authLimiter } from "../middlewares/rateLimit.middleware";

const authRouter = Router();

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     description: Public endpoint. Creates an account and returns a JWT.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 128
 *                 description: Must include letters and numbers
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *     responses:
 *       201:
 *         description: User created; returns token and user profile
 *       409:
 *         description: Email already registered
 */
authRouter.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  AuthController.registerUser,
);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Log in
 *     description: Public endpoint. Returns a JWT on success.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authenticated; returns token and user profile
 *       401:
 *         description: Invalid credentials
 */
authRouter.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  AuthController.loginUser,
);

export default authRouter;
