const programTemplateService = require("../services/template/programTemplate.service");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * Program Template Controller
 * Handles HTTP requests and responses for program template operations
 *
 * TODO/Improvements:
 * 1. Input Validation:
 *    - Add validation middleware for request body schemas
 *    - Validate query parameters for getProgramTemplates
 *    - Sanitize user inputs
 *
 * 2. Additional Endpoints Needed:
 *    - GET /api/v1/templates/featured - Get featured/popular templates
 *    - GET /api/v1/templates/stats - Get usage statistics
 *    - POST /api/v1/templates/:id/duplicate - Clone a template
 *    - POST /api/v1/templates/:id/rate - Add user rating
 *    - GET /api/v1/templates/categories - Get available template categories
 *
 * 3. Authorization:
 *    - Add role-based access control middleware
 *    - Implement template ownership checks
 *    - Add rate limiting for public endpoints
 *
 * 4. Response Enhancement:
 *    - Include metadata in responses (e.g., totalUsers, avgRating)
 *    - Support field selection (e.g., ?fields=name,description)
 *    - Add ETag support for caching
 *    - Implement conditional requests (If-Modified-Since)
 *
 * 5. Query Features:
 *    - Advanced filtering (difficulty level, duration, equipment)
 *    - Search by similar templates
 *    - Sort by popularity/rating
 *    - Filter by user fitness level
 *
 * 6. Bulk Operations:
 *    - Batch create/update templates
 *    - Bulk delete with safety checks
 *    - Mass template status updates
 */

/**
 * @desc    Get all program templates with optional filters
 * @route   GET /api/v1/templates
 * @access  Public
 * @query   {string} splitType - Filter by split type
 * @query   {string} createdBy - Filter by creator ID
 * @query   {string} difficulty - Filter by difficulty level
 * @query   {number} daysPerWeek - Filter by days per week
 * @query   {number} page - Page number
 * @query   {number} limit - Items per page
 * @returns {Object} { success, data: { templates, pagination } }
 */
const getProgramTemplates = async (req, res, next) => {
  try {
    const allowedFilters = [
      "splitType",
      "createdBy",
      "difficulty",
      "daysPerWeek",
    ];
    const filters = {};

    allowedFilters.forEach((key) => {
      if (req.query[key]) filters[key] = req.query[key];
    });

    const result = await programTemplateService.getProgramTemplates(
      filters,
      req.query
    );

    return sendSuccess(res, {
      templates: result.templates,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get program template by ID
 * @route   GET /api/v1/templates/:id
 * @access  Public
 * @param   {string} req.params.id - Template ID
 * @returns {Object} { success, data: { template } }
 * @throws  {404} Template not found
 * @throws  {400} Invalid ID format
 */
const getProgramTemplateById = async (req, res, next) => {
  try {
    const template = await programTemplateService.getProgramTemplateById(
      req.params.id
    );
    return sendSuccess(res, { template });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new program template
 * @route   POST /api/v1/templates
 * @access  Private (Admin)
 * @body    {string} req.body.name - Template name
 * @body    {string} req.body.description - Template description
 * @body    {string} req.body.splitType - Training split type
 * @body    {number} req.body.daysPerWeek - Training days per week
 * @body    {number} req.body.weeksPerCycle - Weeks per mesocycle
 * @body    {Array} req.body.workouts - Workout definitions
 * @returns {Object} { success, message, data: { template } }
 * @throws  {400} Validation error
 * @throws  {409} Template name already exists
 */
const createProgramTemplate = async (req, res, next) => {
  try {
    const template = await programTemplateService.createProgramTemplate(
      req.body
    );
    return sendSuccess(
      res,
      { template },
      "Program template created successfully",
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update program template
 * @route   PUT /api/v1/templates/:id
 * @access  Private (Admin)
 * @param   {string} req.params.id - Template ID
 * @body    Partial template fields to update
 * @returns {Object} { success, message, data: { template } }
 * @throws  {404} Template not found
 * @throws  {400} Validation error
 */
const updateProgramTemplate = async (req, res, next) => {
  try {
    const template = await programTemplateService.updateProgramTemplate(
      req.params.id,
      req.body
    );
    return sendSuccess(
      res,
      { template },
      "Program template updated successfully"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete program template (soft delete)
 * @route   DELETE /api/v1/templates/:id
 * @access  Private (Admin)
 * @param   {string} req.params.id - Template ID
 * @returns {Object} { success, message }
 * @throws  {404} Template not found
 */
const deleteProgramTemplate = async (req, res, next) => {
  try {
    await programTemplateService.deleteProgramTemplate(req.params.id);
    return sendSuccess(res, null, "Program template deleted successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProgramTemplates,
  getProgramTemplateById,
  createProgramTemplate,
  updateProgramTemplate,
  deleteProgramTemplate,
};
