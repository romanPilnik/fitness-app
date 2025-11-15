const exerciseService = require('../services/exercise/exercise.service');
const { sendSuccess } = require('../utils/response');

/**
 * @desc    Get all exercises with optional filtering and pagination
 * @route   GET /api/v1/exercises
 * @access  Public
 * @query   {number} page - Page number
 * @query   {number} limit - Items per page
 * @query   {string} muscle - Filter by primary muscle
 * @query   {string} equipment - Filter by equipment type
 * @query   {string} category - Filter by category (compound/isolation)
 * @returns {Object} { success, count, data: exercises[], pagination }
 */
const getExercises = async (req, res) => {
  const filters = {};
  if (req.query.muscle) {
    filters.primaryMuscle = req.query.muscle;
  }
  if (req.query.equipment) {
    filters.equipment = req.query.equipment;
  }
  if (req.query.category) {
    filters.category = req.query.category;
  }

  const result = await exerciseService.getExercises(filters, req.query);
  return sendSuccess(res, result, 200, 'Exercises retrieved successfully');
};

/**
 * @desc    Get single exercise by ID
 * @route   GET /api/v1/exercises/:id
 * @access  Public
 * @param   {string} req.params.id - Exercise ID
 * @returns {Object} { success, data: exercise }
 * @throws  {404} When exercise not found
 * @throws  {400} When ID format is invalid
 */
const getExerciseById = async (req, res) => {
  const exercise = await exerciseService.getExerciseById(req.params.id);

  return sendSuccess(res, exercise, 200, 'Exercise retrieved successfully');
};

/**
 * @desc    Create new exercise
 * @route   POST /api/v1/exercises
 * @access  Private (Admin)
 * @body    {
 *   name: string,
 *   equipment: string,
 *   primaryMuscle: string,
 *   secondaryMuscles?: string[],
 *   category: string,
 *   movementPattern: string,
 *   instructions?: string
 * }
 * @returns {Object} { success, message, data: exercise }
 * @throws  {409} When exercise name already exists
 * @throws  {400} When validation fails
 */
const createExercise = async (req, res) => {
  const newExercise = await exerciseService.createExercise(req.body);

  return sendSuccess(res, newExercise, 201, 'Exercise created successfully');
};

/**
 * @desc    Update existing exercise
 * @route   PATCH /api/v1/exercises/:id
 * @access  Private (Admin)
 * @param   {string} req.params.id - Exercise ID
 * @body    Partial exercise fields to update
 * @returns {Object} { success, message, data: exercise }
 * @throws  {404} When exercise not found
 * @throws  {400} When validation fails
 */
const updateExercise = async (req, res) => {
  const updatedExercise = await exerciseService.updateExercise(
    req.params.id,
    req.body
  );

  return sendSuccess(
    res,
    updatedExercise,
    200,
    'Exercise updated successfully'
  );
};

/**
 * @desc    Soft delete exercise (set isActive: false)
 * @route   DELETE /api/v1/exercises/:id
 * @access  Private (Admin)
 * @param   {string} req.params.id - Exercise ID
 * @returns {Object} { success, message }
 * @throws  {404} When exercise not found
 */
const deleteExercise = async (req, res) => {
  await exerciseService.deleteExercise(req.params.id);

  return sendSuccess(res, null, 204);
};

module.exports = {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
};
