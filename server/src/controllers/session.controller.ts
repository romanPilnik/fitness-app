import { AppError } from "../errors/AppError";
import { SessionService } from "../services/session/session.service";
import { ERROR_CODES } from "../types/error.types";
import { sendSuccess } from "../utils/response";
import type { Request, Response } from "express";
import type {
  GetSessionsQuery,
  GetSessionByIdParams,
  CreateSessionBody,
  DeleteSessionParams,
} from "../validations/session.validation";

async function getSessions(req: Request, res: Response) {
  if (!req.user)
    throw new AppError("Unauthorized", 401, ERROR_CODES.UNAUTHORIZED_ACCESS);
  const query = req.query as unknown as GetSessionsQuery;
  const sessions = await SessionService.getSessions({
    userId: req.user.id,
    ...query,
  });
  return sendSuccess(res, sessions, 200, "Sessions retrieved");
}

async function getSessionById(
  req: Request<GetSessionByIdParams>,
  res: Response,
) {
  if (!req.user)
    throw new AppError("Unauthorized", 401, ERROR_CODES.UNAUTHORIZED_ACCESS);
  const session = await SessionService.getSessionById({
    sessionId: req.params.id,
    userId: req.user.id,
  });
  return sendSuccess(res, session, 200, "Session retrieved");
}

async function createSession(
  req: Request<object, object, CreateSessionBody>,
  res: Response,
) {
  if (!req.user)
    throw new AppError("Unauthorized", 401, ERROR_CODES.UNAUTHORIZED_ACCESS);
  const session = await SessionService.createSession({
    userId: req.user.id,
    ...req.body,
  });
  return sendSuccess(res, session, 201, "Session logged");
}

async function deleteSession(req: Request<DeleteSessionParams>, res: Response) {
  if (!req.user)
    throw new AppError("Unauthorized", 401, ERROR_CODES.UNAUTHORIZED_ACCESS);
  await SessionService.deleteSession({
    sessionId: req.params.id,
    userId: req.user.id,
  });
  return sendSuccess(res, null, 204);
}

export const SessionController = {
  getSessions,
  getSessionById,
  createSession,
  deleteSession,
};
