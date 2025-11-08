const programTemplateService = require("../services/program/programTemplate.service");
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
 */
const getProgramTemplates = async (req, res, next) => {
  try {
    const filters = {};
    // Add any specific filters based on query params
    if (req.query.splitType) filters.splitType = req.query.splitType;
    if (req.query.createdBy) filters.createdBy = req.query.createdBy;

    const result = await programTemplateService.getProgramTemplates(filters, req.query);

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
 */
const getProgramTemplateById = async (req, res, next) => {
  try {
    const template = await programTemplateService.getProgramTemplateById(req.params.id);
    return sendSuccess(res, { template });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new program template
 * @route   POST /api/v1/templates
 * @access  Private (Admin)
 */
const createProgramTemplate = async (req, res, next) => {
  try {
    const template = await programTemplateService.createProgramTemplate(req.body);
    return sendSuccess(res, { template }, "Program template created successfully", 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update program template
 * @route   PUT /api/v1/templates/:id
 * @access  Private (Admin)
 */
const updateProgramTemplate = async (req, res, next) => {
  try {
    const template = await programTemplateService.updateProgramTemplate(
      req.params.id,
      req.body
    );
    return sendSuccess(res, { template }, "Program template updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete program template (soft delete)
 * @route   DELETE /api/v1/templates/:id
 * @access  Private (Admin)
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