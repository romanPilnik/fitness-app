import { Router } from "express";
import { verifySession } from "@/middlewares/betterAuth.middleware";
import { UserController } from "./user.controller";
import { validate } from "@/middlewares/validate.middleware";
import { updateUser, changePassword } from "./user.validation";
import { authLimiter, apiLimiter } from "@/middlewares/rateLimit.middleware";

const userRouter = Router();

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

/**
 * @openapi
 * /api/v1/users/change-password:
 *   post:
 *     tags:
 *       - Users
 *     summary: Change password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 128
 *                 description: Must contain letters and numbers
 *     responses:
 *       200:
 *         description: Password changed
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized; invalid old password
 */
userRouter.post(
  "/change-password",
  verifySession,
  authLimiter,
  validate(changePassword),
  UserController.changePassword,
);

export default userRouter;
