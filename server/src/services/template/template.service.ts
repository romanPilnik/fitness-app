import type { PaginateResult } from "mongoose";
import { AppError } from "../../errors/AppError";
import { ERROR_CODES } from "../../types/error.types";
import { TemplateModel } from "../../models/Template.model";
import type {
  GetTemplatesInputDTO,
  GetTemplateByIdInputDTO,
  CreateTemplateInputDTO,
  UpdateTemplateInputDTO,
  DeleteTemplateInputDTO,
  TemplateDTO,
  TemplateSummaryDTO,
} from "./template.dto";
import { mapPaginatedTemplates, toTemplateDTO } from "./template.mapper";

async function getTemplates(
  input: GetTemplatesInputDTO = {},
): Promise<PaginateResult<TemplateSummaryDTO>> {
  const { filters = {}, pagination = {} } = input;

  const query: Record<string, unknown> = {};

  if (filters.splitType) query.splitType = filters.splitType;
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.daysPerWeek) query.daysPerWeek = filters.daysPerWeek;
  if (filters.goals && filters.goals.length > 0) {
    query.goals = { $in: filters.goals };
  }

  const textFilter = pagination.q ? { $text: { $search: pagination.q } } : {};
  const queryOptions = { ...query, ...textFilter };

  const paginateOptions = {
    page: pagination.page ?? 1,
    limit: pagination.limit ?? 20,
    select: "-__v",
    sort: { createdAt: -1 },
  };

  const result = await TemplateModel.paginate(queryOptions, paginateOptions);
  return mapPaginatedTemplates(result);
}

async function getTemplateById(
  input: GetTemplateByIdInputDTO,
): Promise<TemplateDTO> {
  const { templateId } = input;

  const template = await TemplateModel.findById(templateId)
    .populate("workouts.exercises.exerciseId", "name")
    .select("-__v");

  if (!template) {
    throw new AppError("Template not found", 404, ERROR_CODES.NOT_FOUND);
  }

  return toTemplateDTO(template);
}

async function createTemplate(
  input: CreateTemplateInputDTO,
): Promise<TemplateDTO> {
  const existing = await TemplateModel.findOne({
    name: input.name,
  });

  if (existing) {
    throw new AppError(
      "Template with this name already exists",
      409,
      ERROR_CODES.DUPLICATE_VALUE,
    );
  }

  const template = new TemplateModel(input);
  const saved = await template.save();
  await saved.populate("workouts.exercises.exerciseId", "name");

  return toTemplateDTO(saved);
}

async function updateTemplate(
  input: UpdateTemplateInputDTO,
): Promise<TemplateDTO> {
  const { templateId, updates } = input;

  const template = await TemplateModel.findByIdAndUpdate(
    templateId,
    { $set: updates },
    { new: true, runValidators: true },
  )
    .select("-__v")
    .populate("workouts.exercises.exerciseId", "name");

  if (!template) {
    throw new AppError("Template not found", 404, ERROR_CODES.NOT_FOUND);
  }

  return toTemplateDTO(template);
}

async function deleteTemplate(input: DeleteTemplateInputDTO): Promise<void> {
  const { templateId } = input;

  const template = await TemplateModel.findByIdAndDelete(templateId);

  if (!template) {
    throw new AppError("Template not found", 404, ERROR_CODES.NOT_FOUND);
  }
}

export const TemplateService = {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
};
