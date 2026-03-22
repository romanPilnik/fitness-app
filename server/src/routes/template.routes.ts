import { Router } from "express";
import {
  createTemplateSchema,
  deleteTemplateSchema,
  getTemplateByIdSchema,
  getTemplatesSchema,
  updateTemplateSchema,
} from "../validations/template.validation";
import { TemplateController } from "../controllers/template.controller";
import { validate } from "../middlewares/validate";
import { verifyToken } from "../middlewares/auth.middleware";


const templateRouter = Router();

templateRouter.get(
  "/",
  validate(getTemplatesSchema),
  TemplateController.getTemplates,
);

templateRouter.post(
  "/",
  verifyToken,
  validate(createTemplateSchema),
  TemplateController.createTemplate,
);

templateRouter.get(
  "/:id",
  validate(getTemplateByIdSchema),
  TemplateController.getTemplateById,
);

templateRouter.patch(
  "/:id",
  verifyToken,
  validate(updateTemplateSchema),
  TemplateController.updateTemplate,
);

templateRouter.delete(
  "/:id",
  verifyToken,
  validate(deleteTemplateSchema),
  TemplateController.deleteTemplate,
);

export default templateRouter;
