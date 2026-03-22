import { TemplateService } from "../services/template/template.service";
import { sendSuccess } from "../utils/response";
import { AppError } from "../errors/AppError";
import { ERROR_CODES } from "../types/error.types";
import type { Request, Response } from "express";
import type {
  GetTemplatesQuery,
  GetTemplateByIdParams,
  CreateTemplateBody,
  UpdateTemplateBody,
  UpdateTemplateParams,
  DeleteTemplateParams,
} from "../validations/template.validation";

async function getTemplates(req: Request, res: Response) {
  const query = req.query as unknown as GetTemplatesQuery;
  const result = await TemplateService.getTemplates({
    ...query,
    userId: req.user?.id,
    myTemplatesOnly: query.myTemplatesOnly,
  });

  return sendSuccess(
    res,
    result,
    200,
    "Program templates retrieved successfully",
  );
}

async function getTemplateById(
  req: Request<GetTemplateByIdParams>,
  res: Response,
) {
  const { id } = req.params;
  const template = await TemplateService.getTemplateById({ id });
  return sendSuccess(
    res,
    template,
    200,
    "Program template retrieved successfully",
  );
}

async function createTemplate(
  req: Request<object, object, CreateTemplateBody>,
  res: Response,
) {
  if (!req.user) {
    throw new AppError("Unauthorized", 401, ERROR_CODES.UNAUTHORIZED_ACCESS);
  }
  const createdByUserId = req.user.role === "admin" ? null : req.user.id;
  const template = await TemplateService.createTemplate({
    ...req.body,
    createdByUserId,
  });
  return sendSuccess(
    res,
    template,
    201,
    "Program template created successfully",
  );
}

async function updateTemplate(
  req: Request<UpdateTemplateParams, object, UpdateTemplateBody>,
  res: Response,
) {
  if (!req.user) {
    throw new AppError("Unauthorized", 401, ERROR_CODES.UNAUTHORIZED_ACCESS);
  }
  const { id } = req.params;
  const { body } = req;
  const userRole = req.user.role;

  const template = await TemplateService.updateTemplate({
    templateId: id,
    userId: req.user.id,
    ...body,
    userRole,
  });
  return sendSuccess(
    res,
    template,
    200,
    "Program template updated successfully",
  );
}

async function deleteTemplate(
  req: Request<DeleteTemplateParams>,
  res: Response,
) {
  if (!req.user) {
    throw new AppError("Unauthorized", 401, ERROR_CODES.UNAUTHORIZED_ACCESS);
  }

  const { id } = req.params;
  const userRole = req.user.role;
  await TemplateService.deleteTemplate({
    templateId: id,
    userId: req.user.id,
    userRole,
  });
  return sendSuccess(res, null, 204);
}

export const TemplateController = {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
};
