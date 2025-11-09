/**
 * @fileoverview Exercise routes for managing exercise library
 * @module routes/exercise
 */

const express = require("express");
const { verifyToken } = require("../middleware/auth");
const requiredRole = require("../middleware/authorize");
const exerciseController = require("../controllers/exercise.controller");
const { body, validationResult } = require("express-validator");

// Simple request validator for creating exercises
const validateExercise = [
  body("name")
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("name is required and must be <= 50 chars"),
  body("primaryMuscle")
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage("primaryMuscle is required"),
  body("category")
    .isIn(["compound", "isolation"])
    .withMessage("category must be 'compound' or 'isolation'"),
  body("movementPattern")
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage("movementPattern is required"),
  // validation result handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================

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
router.get("/", exerciseController.getExercises);

/**
 * GET /api/v1/exercises/:id
 * @route GET /:id
 * @group Exercise - Exercise library operations
 * @param {string} id.path.required - Exercise ID
 * @returns {Object} 200 - Single exercise details
 * @returns {Object} 404 - Exercise not found
 */
router.get("/:id", exerciseController.getExerciseById);

// ============================================
// PROTECTED ROUTES
// ============================================

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
router.post(
  "/",
  verifyToken,
  requiredRole("admin"),
  validateExercise,
  exerciseController.createExercise
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
router.patch(
  "/:id",
  verifyToken,
  requiredRole("admin"),
  exerciseController.updateExercise
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
router.delete(
  "/:id",
  verifyToken,
  requiredRole("admin"),
  exerciseController.deleteExercise
);

module.exports = router;
