/**
 * @fileoverview User program routes for managing workout programs
 * @module routes/program
 */

const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { verifyOwnership } = require('../middleware/ownership');
const UserProgram = require('../models/UserProgram');

const router = express.Router();

// TODO: Import controller when created
// const programController = require('../controllers/program.controller');

// All user program routes require authentication
router.use(verifyToken);

// ============================================
// PROGRAM COLLECTION
// ============================================

/**
 * GET /api/v1/programs
 * @route GET /
 * @group Program - User program operations
 * @param {number} page.query - Page number for pagination
 * @param {number} limit.query - Items per page
 * @param {string} status.query - Filter by status (active/paused/completed)
 * @returns {Object} 200 - List of user's programs
 * @returns {Object} 401 - Unauthorized
 */
router.get('/', async (req, res) => {});

/**
 * POST /api/v1/programs/from-template
 * @route POST /from-template
 * @group Program - User program operations
 * @param {string} templateId.body.required - Template ID to create program from
 * @param {Object} customizations.body - Optional customizations
 * @returns {Object} 201 - Program created from template
 * @returns {Object} 404 - Template not found
 * @returns {Object} 401 - Unauthorized
 */
router.post('/from-template', async (req, res) => {});

/**
 * POST /api/v1/programs/custom
 * @route POST /custom
 * @group Program - User program operations
 * @param {string} name.body.required - Program name
 * @param {string} splitType.body.required - Split type
 * @param {Array} workouts.body.required - Workout definitions
 * @param {Object} periodization.body - Periodization settings
 * @returns {Object} 201 - Custom program created
 * @returns {Object} 400 - Validation error
 * @returns {Object} 401 - Unauthorized
 */
router.post('/custom', async (req, res) => {});

// ============================================
// CONVENIENCE ROUTES
// ============================================

/**
 * GET /api/v1/programs/active
 * @route GET /active
 * @group Program - User program operations
 * @returns {Object} 200 - User's currently active program
 * @returns {Object} 404 - No active program found
 * @returns {Object} 401 - Unauthorized
 */
router.get('/active', async (req, res) => {});

// ============================================
// PROGRAM RESOURCE
// ============================================

/**
 * GET /api/v1/programs/:id
 * @route GET /:id
 * @group Program - User program operations
 * @param {string} id.path.required - Program ID
 * @returns {Object} 200 - Single program details
 * @returns {Object} 404 - Program not found
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (not owner)
 */
router.get('/:id', verifyOwnership(UserProgram), async (req, res) => {});

/**
 * PATCH /api/v1/programs/:id
 * @route PATCH /:id
 * @group Program - User program operations
 * @param {string} id.path.required - Program ID
 * @param {Object} body - Fields to update
 * @returns {Object} 200 - Program updated successfully
 * @returns {Object} 404 - Program not found
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (not owner)
 */
router.patch('/:id', verifyOwnership(UserProgram), async (req, res) => {});

/**
 * DELETE /api/v1/programs/:id
 * @route DELETE /:id
 * @group Program - User program operations
 * @param {string} id.path.required - Program ID
 * @returns {Object} 200 - Program deleted successfully
 * @returns {Object} 404 - Program not found
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (not owner)
 */
router.delete('/:id', verifyOwnership(UserProgram), async (req, res) => {});

module.exports = router;
