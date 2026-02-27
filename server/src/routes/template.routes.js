const express = require("express");
const { verifyToken } = require("../middlewares/auth");
const { requireRole } = require("../middlewares/authorize");
const programTemplateController = require("../controllers/programTemplate.controller");
const { validate } = require("../middlewares/validate.ts");
const templateValidation = require("../validations/template.validation.ts");

const templateRouter = express.Router();

templateRouter.get(
  "/",
  validate(templateValidation.getProgramTemplates),
  programTemplateController.getProgramTemplates,
);

templateRouter.post(
  "/",
  verifyToken,
  requireRole("admin"),
  validate(templateValidation.createProgramTemplate),
  programTemplateController.createProgramTemplate,
);

templateRouter.get(
  "/:id",
  validate(templateValidation.getProgramTemplateById),
  programTemplateController.getProgramTemplateById,
);

templateRouter.patch(
  "/:id",
  verifyToken,
  requireRole("admin"),
  validate(templateValidation.updateProgramTemplate),
  programTemplateController.updateProgramTemplate,
);

templateRouter.delete(
  "/:id",
  verifyToken,
  requireRole("admin"),
  validate(templateValidation.deleteProgramTemplate),
  programTemplateController.deleteProgramTemplate,
);

module.exports = templateRouter;
