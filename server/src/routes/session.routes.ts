import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { SessionController } from "../controllers/session.controller";
import { validate } from "../middlewares/validate";
import {
  getSessionsSchema,
  createSessionSchema,
  deleteSessionSchema,
  getSessionByIdSchema,
} from "../validations/session.validation";

const sessionRouter = Router();

sessionRouter.get(
  "/",
  verifyToken,
  validate(getSessionsSchema),
  SessionController.getSessions,
);

sessionRouter.get(
  "/:id",
  verifyToken,
  validate(getSessionByIdSchema),
  SessionController.getSessionById,
);

sessionRouter.post(
  "/",
  verifyToken,
  validate(createSessionSchema),
  SessionController.createSession,
);

sessionRouter.delete(
  "/:id",
  verifyToken,
  validate(deleteSessionSchema),
  SessionController.deleteSession,
);

export default sessionRouter;
