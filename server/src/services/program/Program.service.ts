import type { PaginateResult } from 'mongoose';
import { AppError } from '../../errors/AppError.js';
import { ERROR_CODES } from '../../types/error.types.js';
import { ProgramModel } from '../../models/Program.model.js';
import { TemplateModel } from '../../models/Template.model.js';
import type {
  CreateCustomProgramInputDTO,
  CreateFromTemplateInputDTO,
  DeleteProgramInputDTO,
  GetActiveProgramInputDTO,
  GetProgramByIdInputDTO,
  GetProgramsInputDTO,
  UpdateProgramInputDTO,
  UpdateProgressInputDTO,
  ProgramDTO,
  ProgramSummaryDTO,
} from './program.dto.js';
import { mapPaginatedPrograms, toProgramDTO } from './program.mapper.js';

async function getPrograms(input: GetProgramsInputDTO): Promise<PaginateResult<ProgramSummaryDTO>> {
  const { userId, filters = {}, pagination = {} } = input;
  const allowedStatuses = ['active', 'paused', 'completed'];

  if (filters.status && !allowedStatuses.includes(filters.status)) {
    throw new AppError('Invalid status filter', 400, ERROR_CODES.INVALID_INPUT);
  }

  const query: Record<string, unknown> = { userId, isActive: true };
  if (filters.status) {
    query.status = filters.status;
  }

  const paginateOptions = {
    page: pagination.page || 1,
    limit: pagination.limit || 20,
    select: '-__v',
    sort: { createdAt: -1 },
    lean: true,
  };

  const result = await ProgramModel.paginate(query, paginateOptions);
  return mapPaginatedPrograms(result);
}

async function createFromTemplate(input: CreateFromTemplateInputDTO): Promise<ProgramDTO> {
  const { userId, templateId, startDate, customizations } = input;

  const template = await TemplateModel.findById(templateId).lean();
  if (!template) {
    throw new AppError('Template not found', 404, ERROR_CODES.NOT_FOUND);
  }

  const workoutOverrides = customizations?.workouts;
  const workouts = template.workouts.map((workout, index) => {
    const override = workoutOverrides?.[index];
    return override ? { ...workout, ...override } : { ...workout };
  });

  const programName = customizations?.name || template.name;

  const existing = await ProgramModel.findOne({
    userId,
    name: programName,
    isActive: true,
  }).lean();

  if (existing) {
    throw new AppError('Program with this name already exists', 409, ERROR_CODES.DUPLICATE_VALUE);
  }

  const programData = {
    userId,
    sourceTemplateId: templateId,
    sourceTemplateName: template.name,
    createdFrom: 'template' as const,
    name: programName,
    description: template.description,
    difficulty: template.difficulty,
    goals: template.goals,
    splitType: template.splitType,
    daysPerWeek: template.daysPerWeek,
    workouts,
    status: 'active' as const,
    startDate: startDate || new Date(),
    currentWeek: 1,
    nextWorkoutIndex: 0,
    hasBeenModified: false,
  };

  const program = new ProgramModel(programData);
  const saved = await program.save();
  return toProgramDTO(saved);
}

async function createCustomProgram(input: CreateCustomProgramInputDTO): Promise<ProgramDTO> {
  const { userId, name } = input;

  const existing = await ProgramModel.findOne({
    userId,
    name,
    isActive: true,
  }).lean();

  if (existing) {
    throw new AppError('Program with this name already exists', 409, ERROR_CODES.DUPLICATE_VALUE);
  }

  const programData = {
    ...input,
    createdFrom: 'scratch' as const,
    status: 'active' as const,
    startDate: input.startDate || new Date(),
    currentWeek: 1,
    nextWorkoutIndex: 0,
    hasBeenModified: false,
  };

  const program = new ProgramModel(programData);
  const saved = await program.save();
  return toProgramDTO(saved);
}

async function getActiveProgram(input: GetActiveProgramInputDTO): Promise<ProgramDTO> {
  const { userId } = input;
  const program = await ProgramModel.findOne({
    userId,
    status: 'active',
    isActive: true,
  })
    .select('-__v')
    .lean();

  if (!program) {
    throw new AppError('No active program found for user', 404, ERROR_CODES.NOT_FOUND);
  }
  return toProgramDTO(program);
};

async function getProgramById(input: GetProgramByIdInputDTO): Promise<ProgramDTO> {
  const { programId, userId } = input;
  const program = await ProgramModel.findOne({
    _id: programId,
    userId,
    isActive: true,
  })
    .populate('workouts.exercises.exerciseId', 'name')
    .select('-__v')
    .lean();

  if (!program) {
    throw new AppError('Program not found', 404, ERROR_CODES.NOT_FOUND);
  }
  return toProgramDTO(program);
};

async function updateProgramById(input: UpdateProgramInputDTO): Promise<ProgramDTO> {
  const { programId, userId, updates } = input;
  const updatedProgram = await ProgramModel.findOneAndUpdate(
    { _id: programId, userId, isActive: true },
    { $set: { ...updates, hasBeenModified: true } },
    { new: true, runValidators: true },
  ).lean();

  if (!updatedProgram) {
    throw new AppError('Program not found', 404, ERROR_CODES.NOT_FOUND);
  }

  return toProgramDTO(updatedProgram);
}

async function deleteProgramById(input: DeleteProgramInputDTO): Promise<void> {
  const { programId, userId } = input;

  const deletedProgram = await ProgramModel.findOneAndUpdate(
    {
      _id: programId,
      userId,
      isActive: true,
    },
    { $set: { isActive: false } },
    { new: true },
  );

  if (!deletedProgram) {
    throw new AppError('Program not found', 404, ERROR_CODES.NOT_FOUND);
  }
}

async function updateProgress(input: UpdateProgressInputDTO): Promise<ProgramDTO> {
  const { programId, userId } = input;

  const program = await ProgramModel.findOne({
    _id: programId,
    userId,
    status: 'active',
    isActive: true,
  });

  if (!program) {
    throw new AppError('Active program not found', 404, ERROR_CODES.NOT_FOUND);
  }

  program.nextWorkoutIndex++;

  if (program.nextWorkoutIndex >= program.workouts.length) {
    program.nextWorkoutIndex = 0;
    program.currentWeek++;
  }

  program.lastCompletedWorkoutDate = new Date();

  await program.save();
  return toProgramDTO(program);
}

export const ProgramService = {
  getPrograms,
  createFromTemplate,
  createCustomProgram,
  getActiveProgram,
  getProgramById,
  updateProgramById,
  deleteProgramById,
  updateProgress,
};
