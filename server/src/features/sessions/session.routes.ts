import { Router } from "express";
import { verifyToken } from "@/middlewares/auth.middleware";
import { SessionController } from "./session.controller";
import { validate } from "@/middlewares/validate.middleware";
import {
  getSessionsSchema,
  createSessionSchema,
  deleteSessionSchema,
  getSessionByIdSchema,
} from "./session.validation";
import { apiLimiter } from "@/middlewares/rateLimit.middleware";

const sessionRouter = Router();

/**
 * @openapi
 * /api/v1/sessions:
 *   get:
 *     tags:
 *       - Sessions
 *     summary: List my sessions (cursor pagination)
 *     parameters:
 *       - in: query
 *         name: sessionStatus
 *         schema:
 *           type: string
 *           enum: [completed, partially, skipped]
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated sessions
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
sessionRouter.get(
  "/",
  verifyToken,
  validate(getSessionsSchema),
  SessionController.getSessions,
);

/**
 * @openapi
 * /api/v1/sessions/{id}:
 *   get:
 *     tags:
 *       - Sessions
 *     summary: Get session by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session with exercises and sets
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
sessionRouter.get(
  "/:id",
  verifyToken,
  validate(getSessionByIdSchema),
  SessionController.getSessionById,
);

/**
 * @openapi
 * /api/v1/sessions:
 *   post:
 *     tags:
 *       - Sessions
 *     summary: Log a workout session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - programId
 *               - workoutName
 *               - dayNumber
 *               - sessionStatus
 *               - sessionDuration
 *               - exercises
 *             properties:
 *               programId:
 *                 type: string
 *               workoutName:
 *                 type: string
 *                 maxLength: 35
 *               dayNumber:
 *                 type: integer
 *                 minimum: 1
 *               sessionStatus:
 *                 type: string
 *                 enum: [completed, partially, skipped]
 *               sessionDuration:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 600
 *               exercises:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - exerciseId
 *                     - order
 *                     - targetSets
 *                     - sets
 *                   properties:
 *                     exerciseId:
 *                       type: string
 *                     order:
 *                       type: integer
 *                       minimum: 1
 *                     targetSets:
 *                       type: integer
 *                       minimum: 1
 *                     targetWeight:
 *                       type: integer
 *                       minimum: 0
 *                     targetTotalReps:
 *                       type: integer
 *                       minimum: 0
 *                     targetTopSetReps:
 *                       type: integer
 *                       minimum: 0
 *                     targetRir:
 *                       type: integer
 *                       minimum: 0
 *                     sets:
 *                       type: array
 *                       minItems: 1
 *                       items:
 *                         type: object
 *                         required:
 *                           - reps
 *                           - weight
 *                           - rir
 *                           - setCompleted
 *                         properties:
 *                           targetWeight:
 *                             type: integer
 *                             minimum: 0
 *                           targetReps:
 *                             type: integer
 *                             minimum: 0
 *                           reps:
 *                             type: integer
 *                             minimum: 0
 *                           weight:
 *                             type: integer
 *                             minimum: 0
 *                           rir:
 *                             type: integer
 *                             minimum: 0
 *                           setCompleted:
 *                             type: boolean
 *     responses:
 *       201:
 *         description: Session created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Related resource not found
 */
sessionRouter.post(
  "/",
  verifyToken,
  apiLimiter,
  validate(createSessionSchema),
  SessionController.createSession,
);

/**
 * @openapi
 * /api/v1/sessions/{id}:
 *   delete:
 *     tags:
 *       - Sessions
 *     summary: Delete session
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
sessionRouter.delete(
  "/:id",
  verifyToken,
  apiLimiter,
  validate(deleteSessionSchema),
  SessionController.deleteSession,
);

export default sessionRouter;
