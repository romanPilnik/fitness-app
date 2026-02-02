import { PaginateResult } from "mongoose";
import { AppError, ERROR_CODES } from "../../errors";
import { ProgramModel } from "../../models/Program.model.js";
import { TemplateModel } from "../../models/Template.model.js";
import { CreateCustomProgramInputDTO, CreateFromTemplateInputDTO, DeleteProgramInputDTO, GetActiveProgramInputDTO, GetProgramByIdInputDTO, GetProgramsInputDTO, ProgramDTO, ProgramSummaryDTO, UpdateProgramInputDTO } from "./program.dto";
import { mapPaginatedPrograms, toProgramDTO } from "./program.mapper";

async function getPrograms(input: GetProgramsInputDTO):Promise<PaginateResult<ProgramSummaryDTO>> {
  const { userId, filters = {}, pagination = {} } = input;
  const allowedStatuses = ['active', 'paused', 'completed'];

  if (filters.status) {
    if (!allowedStatuses.includes(filters.status)) {
      throw new AppError('Invalid status filter', 400, ERROR_CODES.INVALID_INPUT);
    }
  }
  const query = { userId, status: filters.status };

  const paginateOptions = {
    page: pagination.page || 1,
    limit: pagination.limit || 20,
    select: '-__v',
    sort: { createdAt: -1 },
    lean: true,
  };

  const result = await ProgramModel.paginate(query, paginateOptions);
  return mapPaginatedPrograms(result);
};

async function createFromTemplate(input: CreateFromTemplateInputDTO) {
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

  const programData = {
    userId,
    templateId,
    name: customizations?.name || template.name,
    description: template.description,
    splitType: template.splitType,
    daysPerWeek: template.daysPerWeek,
    startDate: startDate || new Date(),
    workouts,
    status: 'active',
  };

  const existing = await ProgramModel.findOne({
    userId,
    name: programData.name,
  }).lean();

  if (existing) {
    throw new AppError('Program with this name already exists', 409, ERROR_CODES.DUPLICATE_VALUE);
  }

  const program = new ProgramModel(programData);
  const saved = await program.save();
  return toProgramDTO(saved);
};

async function createCustomProgram(input: CreateCustomProgramInputDTO){
  const {userId,name} = input;
  const existing = await ProgramModel.findOne({
    userId: userId,
    name: name,
  }).lean();

  if (existing) {
    throw new AppError('Program with this name already exists', 409, ERROR_CODES.DUPLICATE_VALUE);
  }

  const data = {
    ...input,
    startDate: input.startDate || new Date(),
    status: 'active',
  };

  const program = new ProgramModel(data);
  const saved = await program.save();

  return toProgramDTO(saved);
};

async function getActiveProgram(input: GetActiveProgramInputDTO) {
  const { userId } = input;
  const program = await ProgramModel.findOne({
    userId,
    status: 'active',
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
  })
    .populate('workouts.exercises.exerciseId', 'name')
    .select('-__v')
    .lean();

  if (!program) {
    throw new AppError('Program not found', 404, ERROR_CODES.NOT_FOUND);
  }
  return toProgramDTO(program);
};

async function updateProgramById(input: UpdateProgramInputDTO):Promise<ProgramDTO>{
  const { programId, userId, updates } = input;
  const updatedProgram = await ProgramModel.findOneAndUpdate(
    { _id: programId, userId },
    { $set: updates },
    { new: true, runValidators: true },
  );

  if (!updatedProgram) {
    throw new AppError('Program not found', 404, ERROR_CODES.NOT_FOUND);
  }

  return updatedProgram;
};

async function deleteProgramById(input: DeleteProgramInputDTO) {
  const { programId, userId } = input;
  const deletedProgram = await ProgramModel.findOneAndUpdate(
    {
      _id: programId,
      userId,
    },
    { $set: { isActive: false } },
    { new: true },
  );
  if (!deletedProgram) {
    throw new AppError('Program not found', 404, ERROR_CODES.NOT_FOUND);
  }
};

async function updateProgress(){
  const program = ProgramModel.findActiveProgram();
  if (!program) {
    throw new AppError('Program not found', 404, ERROR_CODES.NOT_FOUND);
  }

  program.nextWorkoutIndex++;

  if (program.nextWorkoutIndex >= program.workouts.length) {
    program.nextWorkoutIndex = 0;
    program.currentWeek++;
  }

  program.lastCompletedWorkoutDate = new Date();

  if (program.isComplete) {
    program.status = 'completed';
  }
  await program.save();
};

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
