const express = require("express");
const { verifyToken } = require("../middlewares/auth");
const sessionController = require("../controllers/session.controller");
const { validate } = require("../middlewares/validate.ts");
const sessionValidation = require("../validations/session.validation.ts");

const sessionRouter = express.Router();

sessionRouter.get("/", verifyToken, sessionController.getSessions);

sessionRouter.get(
  "/:sessionId",
  verifyToken,
  validate(sessionValidation.getSessionById),
  sessionController.getSessionById,
);

sessionRouter.post(
  "/create",
  verifyToken,
  validate(sessionValidation.createSession),
  sessionController.createSession,
);

sessionRouter.delete(
  "/:sessionId",
  verifyToken,
  validate(sessionValidation.deleteSession),
  sessionController.deleteSession,
);

module.exports = sessionRouter;
