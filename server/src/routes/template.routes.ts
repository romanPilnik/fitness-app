import { Router } from "express";
import {
  createTemplateSchema,
  deleteTemplateSchema,
  getTemplateByIdSchema,
  getTemplatesSchema,
  updateTemplateSchema,
} from "../validations/template.validation";
import { TemplateController } from "../controllers/template.controller";
import { validate } from "../middlewares/validate.middleware";
import { verifyToken } from "../middlewares/auth.middleware";
import { apiLimiter } from "../middlewares/rateLimit.middleware";

const templateRouter = Router();

/**
 * @openapi
 * /api/v1/programs/templates:
 *   get:
 *     tags:
 *       - Templates
 *     summary: List program templates
 *     security: []
 *     parameters:
 *       - in: query
 *         name: splitType
 *         schema:
 *           type: string
 *           enum: [full_body, push_pull_legs, upper_lower, arnold, modified_full_body, other]
 *       - in: query
 *         name: myTemplatesOnly
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *       - in: query
 *         name: daysPerWeek
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 14
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
 *         description: Paginated templates
 *       400:
 *         description: Validation error
 */
templateRouter.get(
  "/",
  validate(getTemplatesSchema),
  TemplateController.getTemplates,
);

/**
 * @openapi
 * /api/v1/programs/templates:
 *   post:
 *     tags:
 *       - Templates
 *     summary: Create program template
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - daysPerWeek
 *               - difficulty
 *               - splitType
 *               - goal
 *               - workouts
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 50
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               daysPerWeek:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 14
 *               difficulty:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *               splitType:
 *                 type: string
 *                 enum: [full_body, push_pull_legs, upper_lower, arnold, modified_full_body, other]
 *               goal:
 *                 type: string
 *                 enum: [strength, hypertrophy, endurance]
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
 *                           notes:
 *                             type: string
 *                             maxLength: 500
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
templateRouter.post(
  "/",
  verifyToken,
  apiLimiter,
  validate(createTemplateSchema),
  TemplateController.createTemplate,
);

/**
 * @openapi
 * /api/v1/programs/templates/{id}:
 *   get:
 *     tags:
 *       - Templates
 *     summary: Get template by id
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template with workouts
 *       404:
 *         description: Not found
 */
templateRouter.get(
  "/:id",
  validate(getTemplateByIdSchema),
  TemplateController.getTemplateById,
);

/**
 * @openapi
 * /api/v1/programs/templates/{id}:
 *   patch:
 *     tags:
 *       - Templates
 *     summary: Update template
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
 *               daysPerWeek:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 14
 *               difficulty:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *               splitType:
 *                 type: string
 *                 enum: [full_body, push_pull_legs, upper_lower, arnold, modified_full_body, other]
 *               goal:
 *                 type: string
 *                 enum: [strength, hypertrophy, endurance]
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
 *                           notes:
 *                             type: string
 *                             maxLength: 500
 *     responses:
 *       200:
 *         description: Updated template
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
templateRouter.patch(
  "/:id",
  verifyToken,
  apiLimiter,
  validate(updateTemplateSchema),
  TemplateController.updateTemplate,
);

/**
 * @openapi
 * /api/v1/programs/templates/{id}:
 *   delete:
 *     tags:
 *       - Templates
 *     summary: Delete template
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
templateRouter.delete(
  "/:id",
  verifyToken,
  apiLimiter,
  validate(deleteTemplateSchema),
  TemplateController.deleteTemplate,
);

export default templateRouter;
