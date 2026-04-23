import { Router } from "express";
import { verifySession } from "@/middlewares/betterAuth.middleware";
import { requireRole } from "@/middlewares/authorize.middleware";
import { ExerciseController } from "./exercise.controller";
import { validate } from "@/middlewares/validate.middleware";
import {
  getExercisesSchema,
  getExerciseByIdSchema,
  createExerciseSchema,
  deleteExerciseSchema,
  updateExerciseSchema,
} from "./exercise.validation";
import { apiLimiter } from "@/middlewares/rateLimit.middleware";

const exerciseRouter = Router();

/**
 * @openapi
 * /api/v1/exercises:
 *   get:
 *     tags:
 *       - Exercises
 *     summary: List exercises (cursor pagination)
 *     description: Filter by optional query params; supports cursor-based pagination.
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [created_desc, created_asc, name_asc, name_desc]
 *           default: name_asc
 *       - in: query
 *         name: primaryMuscle
 *         schema:
 *           type: string
 *           enum: [chest, back, biceps, triceps, shoulders, forearms, quads, hamstrings, glutes, calves, abs, traps, lats]
 *       - in: query
 *         name: equipment
 *         schema:
 *           type: string
 *           enum: [barbell, dumbbell, cable, machine, bodyweight, bands, kettlebell, none]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [compound, isolation]
 *       - in: query
 *         name: movementPattern
 *         schema:
 *           type: string
 *           enum: [horizontal_push, vertical_push, incline_push, horizontal_pull, vertical_pull, squat, hip_hinge, elbow_flexion, elbow_extension, side_shoulder_isolation, rear_shoulder_isolation, quad_isolation, hamstring_isolation, glute_isolation, calf_isolation, core, carry]
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
 *         description: Paginated exercises
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
exerciseRouter.get(
  "/",
  verifySession,
  validate(getExercisesSchema),
  ExerciseController.getExercises,
);

/**
 * @openapi
 * /api/v1/exercises/{id}:
 *   get:
 *     tags:
 *       - Exercises
 *     summary: Get exercise by id
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exercise found
 *       400:
 *         description: Invalid id
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
exerciseRouter.get(
  "/:id",
  verifySession,
  validate(getExerciseByIdSchema),
  ExerciseController.getExerciseById,
);

/**
 * @openapi
 * /api/v1/exercises:
 *   post:
 *     tags:
 *       - Exercises
 *     summary: Create exercise
 *     description: Authenticated users create a personal exercise (owned by them). Admins create library/system exercises (no owner).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - equipment
 *               - primaryMuscle
 *               - category
 *               - movementPattern
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 50
 *               equipment:
 *                 type: string
 *                 enum: [barbell, dumbbell, cable, machine, bodyweight, bands, kettlebell, none]
 *               primaryMuscle:
 *                 type: string
 *                 enum: [chest, back, biceps, triceps, shoulders, forearms, quads, hamstrings, glutes, calves, abs, traps, lats]
 *               secondaryMuscles:
 *                 type: array
 *                 maxItems: 3
 *                 items:
 *                   type: string
 *                   enum: [chest, back, biceps, triceps, shoulders, forearms, quads, hamstrings, glutes, calves, abs, traps, lats]
 *               category:
 *                 type: string
 *                 enum: [compound, isolation]
 *               movementPattern:
 *                 type: string
 *                 enum: [horizontal_push, vertical_push, incline_push, horizontal_pull, vertical_pull, squat, hip_hinge, elbow_flexion, elbow_extension, side_shoulder_isolation, rear_shoulder_isolation, quad_isolation, hamstring_isolation, glute_isolation, calf_isolation, core, carry]
 *               instructions:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
exerciseRouter.post(
  "/",
  verifySession,
  apiLimiter,
  validate(createExerciseSchema),
  ExerciseController.createExercise,
);

/**
 * @openapi
 * /api/v1/exercises/{id}:
 *   patch:
 *     tags:
 *       - Exercises
 *     summary: Update exercise
 *     description: Only user-owned exercises can be updated; library/system exercises (no owner) return 403.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *                 maxLength: 50
 *               equipment:
 *                 type: string
 *                 enum: [barbell, dumbbell, cable, machine, bodyweight, bands, kettlebell, none]
 *               primaryMuscle:
 *                 type: string
 *                 enum: [chest, back, biceps, triceps, shoulders, forearms, quads, hamstrings, glutes, calves, abs, traps, lats]
 *               secondaryMuscles:
 *                 type: array
 *                 maxItems: 3
 *                 items:
 *                   type: string
 *                   enum: [chest, back, biceps, triceps, shoulders, forearms, quads, hamstrings, glutes, calves, abs, traps, lats]
 *               category:
 *                 type: string
 *                 enum: [compound, isolation]
 *               movementPattern:
 *                 type: string
 *                 enum: [horizontal_push, vertical_push, incline_push, horizontal_pull, vertical_pull, squat, hip_hinge, elbow_flexion, elbow_extension, side_shoulder_isolation, rear_shoulder_isolation, quad_isolation, hamstring_isolation, glute_isolation, calf_isolation, core, carry]
 *               instructions:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not the owner (e.g. system exercise)
 *       404:
 *         description: Not found
 */
exerciseRouter.patch(
  "/:id",
  verifySession,
  apiLimiter,
  validate(updateExerciseSchema),
  ExerciseController.updateExercise,
);

/**
 * @openapi
 * /api/v1/exercises/{id}:
 *   delete:
 *     tags:
 *       - Exercises
 *     summary: Delete exercise (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deleted
 *       400:
 *         description: Invalid id
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not admin, or cannot delete this exercise (e.g. system library row)
 *       404:
 *         description: Not found
 */
exerciseRouter.delete(
  "/:id",
  verifySession,
  requireRole("admin"),
  apiLimiter,
  validate(deleteExerciseSchema),
  ExerciseController.deleteExercise,
);

export default exerciseRouter;
