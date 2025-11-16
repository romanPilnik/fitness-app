const userProgramService = require(`../services/program/userProgram.service`);
const { sendSuccess } = require('../utils/response');

/**
 * @desc    Get all user programs with optional filters
 * @route   GET /api/v1/programs
 * @access  Private
 * @query   {string} [status] - Filter by program status (active, inactive, completed)
 * @query   {number} [page] - Page number for pagination
 * @query   {number} [limit] - Items per page
 * @returns {Object} { success, data: { programs, pagination }, message }
 * @throws  {401} Unauthorized
 */
const getPrograms = async (req, res) => {
  const programs = await userProgramService.getUserPrograms(
    req.user._id,
    req.query
  );
  return sendSuccess(res, programs, 200, 'Programs retrieved');
};

/**
 * @desc    Create user program from template with optional customizations
 * @route   POST /api/v1/programs/from-template
 * @access  Private
 * @body    {string} templateId - Template ID to clone from
 * @body    {string} [startDate] - Program start date (ISO format, defaults to today)
 * @body    {Object} [customizations] - Optional customizations
 * @body    {string} [customizations.name] - Override program name
 * @body    {Object} [customizations.workouts] - Override specific workouts by index
 * @returns {Object} { success, data: program, message }
 * @throws  {404} Template not found
 * @throws  {409} Program name already exists
 * @throws  {400} Validation error
 */
const createFromTemplate = async (req, res) => {
  const { templateId, startDate, customizations } = req.body;

  const program = await userProgramService.createFromTemplate({
    userId: req.user._id,
    templateId,
    startDate,
    customizations,
  });

  return sendSuccess(res, program, 201, 'Program created from template');
};

/**
 * @desc    Create custom user program from scratch
 * @route   POST /api/v1/programs/custom
 * @access  Private
 * @body    {string} name - Program name
 * @body    {string} [description] - Program description
 * @body    {string} splitType - Training split type
 * @body    {number} daysPerWeek - Training days per week
 * @body    {number} weeksPerCycle - Weeks per mesocycle
 * @body    {Array} workouts - Workout definitions
 * @body    {Date} [startDate] - Program start date (defaults to today)
 * @body    {Object} [periodization] - Periodization configuration
 * @returns {Object} { success, data: program, message }
 * @throws  {409} Program name already exists
 * @throws  {400} Validation error
 */
const createCustomProgram = async (req, res) => {
  const program = await userProgramService.createCustomUserProgram({
    userId: req.user._id,
    ...req.body,
  });

  return sendSuccess(res, program, 201, 'Custom program created');
};

/**
 * @desc    Get currently active user program
 * @route   GET /api/v1/programs/active
 * @access  Private
 * @returns {Object} { success, data: program, message }
 * @throws  {404} No active program found
 */
const getActiveProgram = async (req, res) => {
  const program = await userProgramService.getActiveUserProgram(req.user._id);
  return sendSuccess(res, program, 200, 'Active program retrieved');
};

/**
 * @desc    Get user program by ID
 * @route   GET /api/v1/programs/:id
 * @access  Private
 * @param   {string} req.params.id - Program ID
 * @returns {Object} { success, data: program, message }
 * @throws  {404} Program not found
 * @throws  {403} Forbidden (not owner)
 */
const getProgramById = async (req, res) => {
  const program = await userProgramService.getUserProgramById(
    req.params.id,
    req.user._id
  );
  return sendSuccess(res, program, 200, 'Program retrieved');
};

/**
 * @desc    Update user program
 * @route   PATCH /api/v1/programs/:id
 * @access  Private
 * @param   {string} req.params.id - Program ID
 * @body    {string} [name] - Update program name
 * @body    {string} [description] - Update program description
 * @body    {Date} [startDate] - Update start date
 * @body    {string} [status] - Update program status
 * @body    {Array} [workouts] - Update workout definitions
 * @returns {Object} { success, data: program, message }
 * @throws  {404} Program not found
 * @throws  {403} Forbidden (not owner)
 * @throws  {400} Validation error
 */
const updateProgramById = async (req, res) => {
  const program = await userProgramService.updateUserProgramById(
    req.params.id,
    req.user._id,
    req.body
  );
  return sendSuccess(res, program, 200, 'Program updated');
};

/**
 * @desc    Delete user program
 * @route   DELETE /api/v1/programs/:id
 * @access  Private
 * @param   {string} req.params.id - Program ID
 * @returns {Object} { success, message }
 * @throws  {404} Program not found
 * @throws  {403} Forbidden (not owner)
 */
const deleteProgramById = async (req, res) => {
  await userProgramService.deleteUserProgramById(req.params.id, req.user._id);
  return sendSuccess(res, null, 204);
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
