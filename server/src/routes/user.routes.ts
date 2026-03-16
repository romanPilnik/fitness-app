import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { UserController } from "../controllers/user.controller";
import { validate } from "../middlewares/validate";
import { updateUser, changePassword } from "../validations/user.validation";

const userRouter = Router();

userRouter.get("/me", verifyToken, UserController.getCurrentUser);

userRouter.patch(
  "/me",
  verifyToken,
  validate(updateUser),
  UserController.updateCurrentUser,
);

userRouter.post(
  "/change-password",
  verifyToken,
  validate(changePassword),
  UserController.changePassword,
);

export default userRouter;
