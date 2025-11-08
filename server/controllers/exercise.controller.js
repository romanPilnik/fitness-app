const exerciseService = require("../services/exercise/exercise.service");

/**
 * Exercise Controller
 * Handles HTTP requests and responses for exercise operations
 * 
 * TODO/Improvements:
 * 1. Additional Endpoints:
 *    - GET /exercises/trending - Most popular exercises
 *    - GET /exercises/variations/:id - Get exercise variations
 *    - GET /exercises/alternatives/:id - Get alternative exercises
 *    - POST /exercises/:id/feedback - Submit exercise feedback
 *    - POST /exercises/:id/form-check - Submit form check
 * 
 * 2. Enhanced Filtering:
 *    - Support multiple muscle group filtering
 *    - Add difficulty level filtering
 *    - Filter by required equipment
 *    - Support experience level filtering
 *    - Add movement pattern filtering
 * 
 * 3. Response Optimization:
 *    - Implement field selection (?fields=name,muscles)
 *    - Add response compression
 *    - Support partial responses
 *    - Add ETag support
 *    - Implement conditional requests
 * 
 * 4. Bulk Operations:
 *    - Add batch create endpoint
 *    - Support bulk updates
 *    - Implement mass status changes
 *    - Add batch delete capability
 *    - Support exercise import
 * 
 * 5. Media Handling:
 *    - Add image upload endpoint
 *    - Support video submissions
 *    - Handle form check videos
 *    - Manage exercise demonstrations
 *    - Support multiple media formats
 * 
 * 6. Validation & Security:
 *    - Add request rate limiting
 *    - Implement input sanitization
 *    - Add role-based access
 *    - Validate media submissions
 *    - Add abuse prevention
 * 
 * 7. Documentation:
 *    - Add OpenAPI/Swagger specs
 *    - Include example requests
 *    - Document rate limits
 *    - Add error code documentation
 *    - Include usage guidelines
 * 
 * 8. Integration Features:
 *    - Add webhook support
 *    - Support external IDs
 *    - Enable API key authentication
 *    - Add export capabilities
 *    - Support third-party integrations
 */

/**
 * @desc    Get all exercises with optional filtering and pagination
 * @route   GET /api/v1/exercises
 * @access  Public
 * @query   page - Page number
 * @query   limit - Items per page
 * @query   muscle - Filter by primary muscle
 * @query   equipment - Filter by equipment type
 * @query   category - Filter by category (compound/isolation)
 * @returns {Object} { success, count, data: exercises[], pagination }
 */
const getExercises = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.muscle) filters.primaryMuscle = req.query.muscle;
    if (req.query.equipment) filters.equipment = req.query.equipment;
    if (req.query.category) filters.category = req.query.category;

    const result = await exerciseService.getExercises(filters, req.query);

    res.status(200).json({
      success: true,
      count: result.count,
      data: result.exercises,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
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
const getExerciseById = async (req, res, next) => {
  try {
    const exercise = await exerciseService.getExerciseById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: "Exercise not found",
      });
    }

    res.status(200).json({
      success: true,
      data: exercise,
    });
  } catch (error) {
    if (error.type === "VALIDATION_ERROR") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
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
const createExercise = async (req, res, next) => {
  try {
    const newExercise = await exerciseService.createExercise(req.body);

    res.status(201).json({
      success: true,
      message: "Exercise created successfully",
      data: newExercise,
    });
  } catch (error) {
    if (error.type === "DUPLICATE_ERROR") {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }
    next(error);
  }
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
const updateExercise = async (req, res, next) => {
  try {
    const updatedExercise = await exerciseService.updateExercise(
      req.params.id,
      req.body
    );

    if (!updatedExercise) {
      return res.status(404).json({
        success: false,
        message: "Exercise not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Updated successfully",
      data: updatedExercise,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft delete exercise (set isActive: false)
 * @route   DELETE /api/v1/exercises/:id
 * @access  Private (Admin)
 * @param   {string} req.params.id - Exercise ID
 * @returns {Object} { success, message }
 * @throws  {404} When exercise not found
 */
const deleteExercise = async (req, res, next) => {
  try {
    const deletedExercise = await exerciseService.deleteExercise(req.params.id);

    if (!deletedExercise) {
      return res.status(404).json({
        success: false,
        message: "Exercise not found",
      });
    }
    res.status(204).json({
      success: true,
      message: "Exercise deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
};
