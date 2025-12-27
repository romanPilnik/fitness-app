/**
 * @fileoverview Exercise routes for managing exercise library
 * @module routes/exercise
 */

const express = require('express');
const { verifyToken } = require('../middlewares/auth');
const {requireRole} = require('../middlewares/authorize');
const exerciseController = require('../controllers/exercise.controller');
const validate = require('../middlewares/validate');
const exerciseValidation = require('../validations/exercise.validation');

const exerciseRouter = express.Router();

/**
 * GET /api/v1/exercises
 * @route GET /
 * @group Exercise - Exercise library operations
 * @param {number} page.query - Page number for pagination
 * @param {number} limit.query - Items per page
 * @param {string} muscle.query - Filter by muscle group
 * @param {string} equipment.query - Filter by equipment
 * @param {string} category.query - Filter by category
 * @param {string} search.query - Search term
 * @returns {Object} 200 - List of exercises with pagination
 */
exerciseRouter.get('/', validate(exerciseValidation.getExercises), exerciseController.getExercises);

/**
 * GET /api/v1/exercises/:id
 * @route GET /:id
 * @group Exercise - Exercise library operations
 * @param {string} id.path.required - Exercise ID
 * @returns {Object} 200 - Single exercise details
 * @returns {Object} 404 - Exercise not found
 */
exerciseRouter.get(
  '/:id',
  validate(exerciseValidation.getExerciseById),
  exerciseController.getExerciseById,
);

/**
 * POST /api/v1/exercises
 * @route POST /
 * @group Exercise - Exercise library operations
 * @param {string} name.body.required - Exercise name (max 50 chars)
 * @param {string} equipment.body - Required equipment
 * @param {string} primaryMuscle.body.required - Primary muscle group
 * @param {string} category.body.required - Category (compound/isolation)
 * @param {string} movementPattern.body.required - Movement pattern
 * @returns {Object} 201 - Exercise created successfully
 * @returns {Object} 400 - Validation error
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (admin only)
 */
exerciseRouter.post(
  '/',
  verifyToken,
  requireRole('admin'),
  validate(exerciseValidation.createExercise),
  exerciseController.createExercise,
);

/**
 * PATCH /api/v1/exercises/:id
 * @route PATCH /:id
 * @group Exercise - Exercise library operations
 * @param {string} id.path.required - Exercise ID
 * @param {Object} body - Partial exercise fields to update
 * @returns {Object} 200 - Exercise updated successfully
 * @returns {Object} 404 - Exercise not found
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (admin only)
 */
exerciseRouter.patch(
  '/:id',
  verifyToken,
  requireRole('admin'),
  validate(exerciseValidation.updateExercise),
  exerciseController.updateExercise,
);

/**
 * DELETE /api/v1/exercises/:id
 * @route DELETE /:id
 * @group Exercise - Exercise library operations
 * @param {string} id.path.required - Exercise ID
 * @returns {Object} 200 - Exercise deleted successfully
 * @returns {Object} 404 - Exercise not found
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 403 - Forbidden (admin only)
 */
exerciseRouter.delete(
  '/:id',
  verifyToken,
  requireRole('admin'),
  validate(exerciseValidation.deleteExercise),
  exerciseController.deleteExercise,
);

module.exports = exerciseRouter;
