import { Router } from "express";
import { verifySession } from "@/middlewares/betterAuth.middleware";
import { UserController } from "./user.controller";
import { validate } from "@/middlewares/validate.middleware";
import { updateUser, patchAiPreferences } from "./user.validation";
import { apiLimiter } from "@/middlewares/rateLimit.middleware";

const userRouter = Router();

/**
 * @openapi
 * /api/v1/users/me/ai-preferences:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get AI workout target preferences
 *     responses:
 *       200:
 *         description: Current AI preferences (normalized with defaults)
 *       401:
 *         description: Unauthorized
 */
userRouter.get("/me/ai-preferences", verifySession, UserController.getAiPreferences);

/**
 * @openapi
 * /api/v1/users/me/ai-preferences:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Update AI workout target preferences
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               progressionStyle:
 *                 type: string
 *                 enum: [conservative, moderate, aggressive]
 *               progressionPreference:
 *                 type: string
 *                 enum: [weight, reps, balanced]
 *               deloadSensitivity:
 *                 type: string
 *                 enum: [low, medium, high]
 *               rirFloor:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 4
 *     responses:
 *       200:
 *         description: Updated AI preferences
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
userRouter.patch(
  "/me/ai-preferences",
  verifySession,
  apiLimiter,
  validate(patchAiPreferences),
  UserController.patchAiPreferences,
);

/**
 * @openapi
 * /api/v1/users/me:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get current user
 *     responses:
 *       200:
 *         description: Current user profile (no password)
 *       401:
 *         description: Unauthorized
 */
userRouter.get("/me", verifySession, UserController.getCurrentUser);

/**
 * @openapi
 * /api/v1/users/me:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Update current user profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               units:
 *                 type: string
 *                 enum: [metric, imperial]
 *               weekStartsOn:
 *                 type: string
 *                 enum: [sunday, monday, saturday]
 *     responses:
 *       200:
 *         description: Updated user
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
userRouter.patch(
  "/me",
  verifySession,
  apiLimiter,
  validate(updateUser),
  UserController.updateCurrentUser,
);

export default userRouter;
