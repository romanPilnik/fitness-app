import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { registerSchema, loginSchema } from "../validations/auth.validation";

const authRouter = Router();

authRouter.post(
  "/register",
  validate(registerSchema),
  AuthController.registerUser,
);

authRouter.post("/login", validate(loginSchema), AuthController.loginUser);

export default authRouter;
