import { PaginateResult } from "mongoose";
import { AppError, ERROR_CODES } from "../../errors";
import { ProgramModel } from "../../models/Program.model";
import { TemplateModel } from "../../models/Template.model";
import { CreateCustomProgramInputDTO, CreateFromTemplateInputDTO, GetActiveProgramInputDTO, GetProgramByIdInputDTO, GetProgramsInputDTO, ProgramDTO, ProgramSummaryDTO } from "./program.dto";
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
    periodization: template.periodization,
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
  return saved;
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

  return saved;
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
  return program;
};

/**
 * Get a user program by ID
 * @param {string} programId - Program ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User program object
 * @throws {Error} 404 - Program not found
 * @throws {Error} 400 - Invalid program ID format
 */

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

/**
 * Update a user program
 * @param {string} programId - Program ID
 * @param {Object} updates - Fields to update
 * @param {string} [updates.name] - Updated program name
 * @param {string} [updates.description] - Updated program description
 * @param {Date} [updates.startDate] - Updated start date
 * @param {string} [updates.status] - Updated program status
 * @param {Array} [updates.workouts] - Updated workout definitions
 * @returns {Promise<Object>} Updated user program object
 * @throws {Error} 404 - Program not found
 * @throws {Error} 400 - Validation error or invalid program ID
 */

const updateProgramById = async (programId, userId, updates) => {
  const updatedProgram = await UserProgram.findOneAndUpdate(
    { _id: programId, userId },
    { $set: updates },
    { new: true, runValidators: true },
  );

  if (!updatedProgram) {
    const error = new Error('Program not found');
    error.statusCode = 404;
    throw error;
  }

  return updatedProgram;
};

/**
 * Delete a user program
 * @param {string} programId - Program ID
 * @returns {Promise<void>}
 * @throws {Error} 404 - Program not found
 * @throws {Error} 400 - Invalid program ID format
 */

const deleteProgramById = async (programId, userId) => {
  const deletedProgram = await UserProgram.findOneAndUpdate(
    {
      _id: programId,
      userId,
    },
    { $set: { isActive: false } },
    { new: true },
  );
  if (!deletedProgram) {
    const error = new Error('Program not found');
    error.statusCode = 404;
    throw error;
  }
};

const updateProgress = async (_userId, _session) => {
  const program = await UserProgram.findActiveProgram();
  if (!program) {
    const error = new Error('Program not found');
    error.statusCode = 404;
    throw error;
  }

  program.nextWorkoutIndex++;

  if (program.nextWorkoutIndex >= program.workouts.length) {
    program.nextWorkoutIndex = 0;
    program.currentWeek++;
  }

  program.lastCompletedWorkoutDate = Date.now();

  if (program.isComplete) {
    program.status = 'completed';
  }

  if (program.periodization.config.deloadWeek && program.isDeloadWeek()) {
    // Deload logic to be added
  }
  await program.save();
};

module.exports = {
  getPrograms,
  createFromTemplate,
  createCustomProgram,
  getActiveProgram,
  getProgramById,
  updateProgramById,
  deleteProgramById,
  updateProgress,
};
