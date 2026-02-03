import type { PaginateResult } from 'mongoose';
import { AppError } from '../../errors/AppError.js';
import { ERROR_CODES } from '../../types/error.types.js';
import { TemplateModel } from '../../models/Template.model.js';
import type {
  GetTemplatesInputDTO,
  GetTemplateByIdInputDTO,
  CreateTemplateInputDTO,
  UpdateTemplateInputDTO,
  DeleteTemplateInputDTO,
  ProgramTemplateDTO,
  ProgramTemplateSummaryDTO,
} from './template.dto.js';
import { mapPaginatedTemplates, toProgramTemplateDTO } from './template.mapper.js';

async function getTemplates(
  input: GetTemplatesInputDTO = {},
): Promise<PaginateResult<ProgramTemplateSummaryDTO>> {
  const { filters = {}, pagination = {} } = input;

  const query: Record<string, unknown> = { isActive: true };

  if (filters.splitType) query.splitType = filters.splitType;
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.daysPerWeek) query.daysPerWeek = filters.daysPerWeek;
  if (filters.goals && filters.goals.length > 0) {
    query.goals = { $in: filters.goals };
  }

  const textFilter = pagination.q ? { $text: { $search: pagination.q } } : {};
  const queryOptions = { ...query, ...textFilter };

  const paginateOptions = {
    page: pagination.page || 1,
    limit: pagination.limit || 20,
    select: '-__v',
    sort: { createdAt: -1 },
    lean: true,
  };

  const result = await TemplateModel.paginate(queryOptions, paginateOptions);
  return mapPaginatedTemplates(result);
}

async function getTemplateById(input: GetTemplateByIdInputDTO): Promise<ProgramTemplateDTO> {
  const { templateId } = input;

  const template = await TemplateModel.findOne({
    _id: templateId,
    isActive: true,
  })
    .populate('workouts.exercises.exerciseId', 'name')
    .select('-__v')
    .lean();

  if (!template) {
    throw new AppError('Template not found', 404, ERROR_CODES.NOT_FOUND);
  }

  return toProgramTemplateDTO(template);
}

async function createTemplate(input: CreateTemplateInputDTO): Promise<ProgramTemplateDTO> {
  const { templateData } = input;

  const existing = await TemplateModel.findOne({
    name: templateData.name,
    isActive: true,
  }).lean();

  if (existing) {
    throw new AppError('Template with this name already exists', 409, ERROR_CODES.DUPLICATE_VALUE);
  }

  const template = new TemplateModel({
    ...templateData,
    isActive: true,
  });
  const saved = await template.save();

  return toProgramTemplateDTO(saved);
}

async function updateTemplate(input: UpdateTemplateInputDTO): Promise<ProgramTemplateDTO> {
  const { templateId, updates } = input;

  const allowedUpdates = [
    'name',
    'description',
    'difficulty',
    'goals',
    'workouts',
    'daysPerWeek',
    'splitType',
  ];

  const sanitizedUpdates: Record<string, unknown> = {};
  Object.keys(updates).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      sanitizedUpdates[key] = updates[key as keyof typeof updates];
    }
  });

  const template = await TemplateModel.findOneAndUpdate(
    { _id: templateId, isActive: true },
    { $set: sanitizedUpdates },
    { new: true, runValidators: true },
  )
    .select('-__v')
    .lean();

  if (!template) {
    throw new AppError('Template not found', 404, ERROR_CODES.NOT_FOUND);
  }

  return toProgramTemplateDTO(template);
}

async function deleteTemplate(input: DeleteTemplateInputDTO): Promise<void> {
  const { templateId } = input;

  const template = await TemplateModel.findOneAndUpdate(
    { _id: templateId, isActive: true },
    { $set: { isActive: false } },
    { new: true },
  );

  if (!template) {
    throw new AppError('Template not found', 404, ERROR_CODES.NOT_FOUND);
  }
}

export const TemplateService = {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
};
