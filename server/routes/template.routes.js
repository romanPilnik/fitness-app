/**
 * @fileoverview Program template routes for managing workout templates
 * @module routes/template
 */

const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorize');
const programTemplateController = require('../controllers/programTemplate.controller');

const templateRouter = express.Router();

// ============================================
// TEMPLATE COLLECTION
// ============================================

/**
 * GET /api/v1/programs/templates
 * @route GET /
 * @group Template - Program template operations
 * @param {number} page.query - Page number for pagination
 * @param {number} limit.query - Items per page
 * @param {string} splitType.query - Filter by split type
 * @param {number} daysPerWeek.query - Filter by days per week
 * @param {string} difficulty.query - Filter by difficulty level
 * @param {string} goals.query - Filter by goals
 * @param {string} search.query - Search term
 * @returns {Object} 200 - List of templates with pagination
 */
templateRouter.get('/', programTemplateController.getProgramTemplates);

/**
 * POST /api/v1/programs/templates
 * @route POST /
 * @group Template - Program template operations
 * @param {string} name.body.required - Template name
 * @param {string} splitType.body.required - Split type
 * @param {number} daysPerWeek.body.required - Days per week
 * @param {string} difficulty.body.required - Difficulty level
 * @param {Array} goals.body.required - Training goals
 * @param {string} createdBy.body.required - Creator ID
 * @returns {Object} 201 - Template created successfully
 * @returns {Object} 400 - Validation error
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (admin only)
 */
templateRouter.post(
  '/',
  verifyToken,
  requireRole('admin'),
  programTemplateController.createProgramTemplate,
);

// ============================================
// TEMPLATE RESOURCE
// ============================================

/**
 * GET /api/v1/programs/templates/:id
 * @route GET /:id
 * @group Template - Program template operations
 * @param {string} id.path.required - Template ID
 * @returns {Object} 200 - Single template details
 * @returns {Object} 404 - Template not found
 */
templateRouter.get('/:id', programTemplateController.getProgramTemplateById);

/**
 * PATCH /api/v1/programs/templates/:id
 * @route PATCH /:id
 * @group Template - Program template operations
 * @param {string} id.path.required - Template ID
 * @param {Object} body - Fields to update
 * @returns {Object} 200 - Template updated successfully
 * @returns {Object} 404 - Template not found
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (admin only)
 */
templateRouter.patch(
  '/:id',
  verifyToken,
  requireRole('admin'),
  programTemplateController.updateProgramTemplate,
);

/**
 * DELETE /api/v1/programs/templates/:id
 * @route DELETE /:id
 * @group Template - Program template operations
 * @param {string} id.path.required - Template ID
 * @returns {Object} 200 - Template deleted successfully
 * @returns {Object} 404 - Template not found
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (admin only)
 */
templateRouter.delete(
  '/:id',
  verifyToken,
  requireRole('admin'),
  programTemplateController.deleteProgramTemplate,
);

module.exports = templateRouter;
