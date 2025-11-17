const UserProgram = require('../../models/UserProgram');
const { parsePaginationParams, calculatePagination } = require('../../utils/pagination');
const ProgramTemplateModel = require('../../models/ProgramTemplate');

/**
 * Get all user programs with optional filters and pagination
 * @param {Object} options - Query options
 * @param {string} [options.status] - Filter by status (active, paused, completed)
 * @param {number} [options.page] - Page number for pagination
 * @param {number} [options.limit] - Items per page
 * @returns {Promise<{programs: Array, count: number, pagination: Object}>} List of user programs with pagination info
 * @throws {Error} 400 - Invalid status provided
 */
const getPrograms = async (userId, options = {}) => {
  const allowedStatuses = ['active', 'paused', 'completed'];

  const filters = { userId };

  if (options.status) {
    if (!allowedStatuses.includes(options.status)) {
      const error = new Error('Invalid status');
      error.statusCode = 400;
      throw error;
    }
    filters.status = options.status;
  }

  const { page, limit, skip } = parsePaginationParams(options);

  const programs = await UserProgram.find(filters)
    .select('-__v')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();

  const count = await UserProgram.countDocuments(filters);
  const pagination = calculatePagination(count, page, limit);

  return {
    programs,
    count,
    pagination,
  };
};

/**
 * Create user program from template with optional customizations
 * @param {Object} data
 * @param {string} data.userId - User ID
 * @param {string} data.templateId - Template ID to clone from
 * @param {Date} [data.startDate] - Program start date (defaults to today)
 * @param {Object} [data.customizations] - Optional customizations
 * @param {string} [data.customizations.name] - Override program name
 * @param {Object} [data.customizations.workouts] - Override specific workouts
 * @returns {Promise<Object>} Created user program
 * @throws {Error} 404 - Template not found
 * @throws {Error} 409 - Program name already exists
 */
const createFromTemplate = async (data) => {
  const { userId, templateId, startDate, customizations } = data;

  const template = await ProgramTemplateModel.findById(templateId).lean();
  if (!template) {
    const error = new Error('Program template not found');
    error.statusCode = 404;
    throw error;
  }

  const programData = {
    userId,
    templateId,
    name: customizations?.name || template.name,
    description: template.description,
    splitType: template.splitType,
    daysPerWeek: template.daysPerWeek,
    weeksPerCycle: template.weeksPerCycle,
    startDate: startDate || new Date(),
    workouts: template.workouts,
    periodization: template.periodization,
    status: 'active',
  };

  if (customizations?.workouts) {
    programData.workouts = programData.workouts.map((workout, index) => {
      const override = customizations.workouts[index];

      return override ? { ...workout, ...override } : workout;
    });
  }

  const existing = await UserProgram.findOne({
    userId,
    name: programData.name,
  }).lean();

  if (existing) {
    const error = new Error('Program with this name already exists');
    error.statusCode = 409;
    throw error;
  }

  const program = new UserProgram(programData);
  const saved = await program.save();
  return saved;
};

/**
 * Create a custom user program from scratch
 * @param {Object} programData - Program creation data
 * @param {string} programData.userId - User ID
 * @param {string} programData.name - Program name
 * @param {string} [programData.description] - Program description
 * @param {string} programData.splitType - Training split type
 * @param {number} programData.daysPerWeek - Training days per week
 * @param {number} programData.weeksPerCycle - Weeks per mesocycle
 * @param {Array} programData.workouts - Workout definitions
 * @param {Date} [programData.startDate] - Program start date (defaults to today)
 * @param {Object} [programData.periodization] - Periodization config (uses defaults if not provided)
 * @returns {Promise<Object>} Created custom user program
 * @throws {Error} 409 - Program name already exists
 * @throws {Error} 400 - Validation error
 */
const createCustomProgram = async (programData) => {
  const existing = await UserProgram.findOne({
    userId: programData.userId,
    name: programData.name,
  }).lean();

  if (existing) {
    const error = new Error('Program with this name already exists');
    error.statusCode = 409;
    throw error;
  }

  const data = {
    ...programData,
    startDate: programData.startDate || new Date(),
    status: 'active',
  };

  const program = new UserProgram(data);
  const saved = await program.save();

  return saved;
};

/**
 * Get the currently active program for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Active user program object
 * @throws {Error} 404 - No active program found for user
 * @throws {Error} 400 - Invalid user ID
 */

const getActiveProgram = async (userId) => {
  const program = await UserProgram.findOne({
    userId,
    status: 'active',
  })
    .select('-__v')
    .lean();

  if (!program) {
    const error = new Error('Program not found');
    error.statusCode = 404;
    throw error;
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

const getProgramById = async (programId, userId) => {
  const program = await UserProgram.findOne({
    _id: programId,
    userId,
  })
    .select('-__v')
    .lean();

  if (!program) {
    const error = new Error('Program not found');
    error.statusCode = 404;
    throw error;
  }
  return program;
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

module.exports = {
  getPrograms,
  createFromTemplate,
  createCustomProgram,
  getActiveProgram,
  getProgramById,
  updateProgramById,
  deleteProgramById,
};
