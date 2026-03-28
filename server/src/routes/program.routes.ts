import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { ProgramController } from "../controllers/program.controller";
import { apiLimiter } from "../middlewares/rateLimit.middleware";
import {
  getProgramsSchema,
  getProgramByIdSchema,
  createFromTemplateSchema,
  createCustomProgramSchema,
  updateProgramSchema,
  deleteProgramSchema,
  addProgramWorkoutSchema,
  updateProgramWorkoutSchema,
  deleteProgramWorkoutSchema,
  addWorkoutExerciseSchema,
  updateWorkoutExerciseSchema,
  deleteWorkoutExerciseSchema,
  bulkReorderWorkoutExercisesSchema,
} from "../validations/program.validation";

const programRouter = Router();

/**
 * @openapi
 * /api/v1/programs:
 *   get:
 *     tags:
 *       - Programs
 *     summary: List my programs (cursor pagination)
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, paused, completed]
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *       - in: query
 *         name: goal
 *         schema:
 *           type: string
 *           enum: [strength, hypertrophy, endurance]
 *       - in: query
 *         name: splitType
 *         schema:
 *           type: string
 *           enum: [full_body, push_pull_legs, upper_lower, arnold, modified_full_body, other]
 *       - in: query
 *         name: createdFrom
 *         schema:
 *           type: string
 *           enum: [template, scratch, shared]
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
 *         description: Paginated programs
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
programRouter.get(
  "/",
  verifyToken,
  validate(getProgramsSchema),
  ProgramController.getPrograms,
);

/**
 * @openapi
 * /api/v1/programs/active:
 *   get:
 *     tags:
 *       - Programs
 *     summary: Get active program for current user
 *     responses:
 *       200:
 *         description: Array of programs with status active (may be empty)
 *       401:
 *         description: Unauthorized
 */
programRouter.get("/active", verifyToken, ProgramController.getActiveProgram);

/**
 * @openapi
 * /api/v1/programs/{id}:
 *   get:
 *     tags:
 *       - Programs
 *     summary: Get program by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Program with workouts
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
programRouter.get(
  "/:id",
  verifyToken,
  validate(getProgramByIdSchema),
  ProgramController.getProgramById,
);

/**
 * @openapi
 * /api/v1/programs/from-template:
 *   post:
 *     tags:
 *       - Programs
 *     summary: Create program from template
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - templateId
 *             properties:
 *               templateId:
 *                 type: string
 *               name:
 *                 type: string
 *                 maxLength: 50
 *               startDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Program created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Template not found
 */
programRouter.post(
  "/from-template",
  verifyToken,
  apiLimiter,
  validate(createFromTemplateSchema),
  ProgramController.createFromTemplate,
);

/**
 * @openapi
 * /api/v1/programs/custom:
 *   post:
 *     tags:
 *       - Programs
 *     summary: Create custom program with workouts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - difficulty
 *               - goal
 *               - splitType
 *               - daysPerWeek
 *               - workouts
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 50
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               difficulty:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *               goal:
 *                 type: string
 *                 enum: [strength, hypertrophy, endurance]
 *               splitType:
 *                 type: string
 *                 enum: [full_body, push_pull_legs, upper_lower, arnold, modified_full_body, other]
 *               daysPerWeek:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 14
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               workouts:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - dayNumber
 *                     - exercises
 *                   properties:
 *                     name:
 *                       type: string
 *                       maxLength: 50
 *                     dayNumber:
 *                       type: integer
 *                       minimum: 1
 *                       maximum: 14
 *                     exercises:
 *                       type: array
 *                       minItems: 1
 *                       items:
 *                         type: object
 *                         required:
 *                           - exerciseId
 *                           - order
 *                           - targetSets
 *                         properties:
 *                           exerciseId:
 *                             type: string
 *                           order:
 *                             type: integer
 *                             minimum: 1
 *                           targetSets:
 *                             type: integer
 *                             minimum: 1
 *                           targetWeight:
 *                             type: number
 *                           targetTotalReps:
 *                             type: integer
 *                           targetTopSetReps:
 *                             type: integer
 *                           targetRir:
 *                             type: integer
 *     responses:
 *       201:
 *         description: Program created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
programRouter.post(
  "/custom",
  verifyToken,
  apiLimiter,
  validate(createCustomProgramSchema),
  ProgramController.createCustomProgram,
);

/**
 * @openapi
 * /api/v1/programs/{id}:
 *   patch:
 *     tags:
 *       - Programs
 *     summary: Update program metadata
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
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               difficulty:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *               goal:
 *                 type: string
 *                 enum: [strength, hypertrophy, endurance]
 *               splitType:
 *                 type: string
 *                 enum: [full_body, push_pull_legs, upper_lower, arnold, modified_full_body, other]
 *               daysPerWeek:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 14
 *               status:
 *                 type: string
 *                 enum: [active, paused, completed]
 *               startDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
programRouter.patch(
  "/:id",
  verifyToken,
  apiLimiter,
  validate(updateProgramSchema),
  ProgramController.updateProgram,
);

/**
 * @openapi
 * /api/v1/programs/{id}:
 *   delete:
 *     tags:
 *       - Programs
 *     summary: Delete program
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
programRouter.delete(
  "/:id",
  verifyToken,
  apiLimiter,
  validate(deleteProgramSchema),
  ProgramController.deleteProgram,
);

/**
 * @openapi
 * /api/v1/programs/{id}/workouts:
 *   post:
 *     tags:
 *       - Programs
 *     summary: Add workout to program
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
 *             required:
 *               - name
 *               - dayNumber
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 50
 *               dayNumber:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 14
 *     responses:
 *       201:
 *         description: Workout created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Program not found
 */
programRouter.post(
  "/:id/workouts",
  verifyToken,
  apiLimiter,
  validate(addProgramWorkoutSchema),
  ProgramController.addProgramWorkout,
);

/**
 * @openapi
 * /api/v1/programs/{id}/workouts/{workoutId}:
 *   patch:
 *     tags:
 *       - Programs
 *     summary: Update program workout
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: workoutId
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
 *               dayNumber:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 14
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
programRouter.patch(
  "/:id/workouts/:workoutId",
  verifyToken,
  apiLimiter,
  validate(updateProgramWorkoutSchema),
  ProgramController.updateProgramWorkout,
);

/**
 * @openapi
 * /api/v1/programs/{id}/workouts/{workoutId}:
 *   delete:
 *     tags:
 *       - Programs
 *     summary: Delete program workout
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: workoutId
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
programRouter.delete(
  "/:id/workouts/:workoutId",
  verifyToken,
  apiLimiter,
  validate(deleteProgramWorkoutSchema),
  ProgramController.deleteProgramWorkout,
);

/**
 * @openapi
 * /api/v1/programs/{id}/workouts/{workoutId}/exercises:
 *   post:
 *     tags:
 *       - Programs
 *     summary: Add exercise to program workout
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: workoutId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - exerciseId
 *               - order
 *               - targetSets
 *             properties:
 *               exerciseId:
 *                 type: string
 *               order:
 *                 type: integer
 *                 minimum: 1
 *               targetSets:
 *                 type: integer
 *                 minimum: 1
 *               targetWeight:
 *                 type: number
 *               targetTotalReps:
 *                 type: integer
 *               targetTopSetReps:
 *                 type: integer
 *               targetRir:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Exercise slot created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
programRouter.post(
  "/:id/workouts/:workoutId/exercises",
  verifyToken,
  apiLimiter,
  validate(addWorkoutExerciseSchema),
  ProgramController.addWorkoutExercise,
);

/**
 * @openapi
 * /api/v1/programs/{id}/workouts/{workoutId}/exercises/reorder:
 *   put:
 *     tags:
 *       - Programs
 *     summary: Bulk reorder exercises in workout
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: workoutId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - exercises
 *             properties:
 *               exercises:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - order
 *                   properties:
 *                     id:
 *                       type: string
 *                     order:
 *                       type: integer
 *                       minimum: 1
 *     responses:
 *       200:
 *         description: Reordered
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
programRouter.put(
  "/:id/workouts/:workoutId/exercises/reorder",
  verifyToken,
  apiLimiter,
  validate(bulkReorderWorkoutExercisesSchema),
  ProgramController.bulkReorderWorkoutExercises,
);

/**
 * @openapi
 * /api/v1/programs/{id}/workouts/{workoutId}/exercises/{exerciseId}:
 *   patch:
 *     tags:
 *       - Programs
 *     summary: Update workout exercise targets
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: workoutId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: exerciseId
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
 *               order:
 *                 type: integer
 *                 minimum: 1
 *               targetSets:
 *                 type: integer
 *                 minimum: 1
 *               targetWeight:
 *                 type: number
 *               targetTotalReps:
 *                 type: integer
 *               targetTopSetReps:
 *                 type: integer
 *               targetRir:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
programRouter.patch(
  "/:id/workouts/:workoutId/exercises/:exerciseId",
  verifyToken,
  apiLimiter,
  validate(updateWorkoutExerciseSchema),
  ProgramController.updateWorkoutExercise,
);

/**
 * @openapi
 * /api/v1/programs/{id}/workouts/{workoutId}/exercises/{exerciseId}:
 *   delete:
 *     tags:
 *       - Programs
 *     summary: Remove exercise from workout
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: workoutId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: exerciseId
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
programRouter.delete(
  "/:id/workouts/:workoutId/exercises/:exerciseId",
  verifyToken,
  apiLimiter,
  validate(deleteWorkoutExerciseSchema),
  ProgramController.deleteWorkoutExercise,
);

export default programRouter;
