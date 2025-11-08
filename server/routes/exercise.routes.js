const express = require("express");
const { verifyToken } = require("../middleware/auth");
const requiredRole = require("../middleware/authorize");
const exerciseController = require("../controllers/exercise.controller");
const { body, validationResult } = require("express-validator");

// Simple request validator for creating exercises
const validateExercise = [
  body("name").isString().trim().isLength({ min: 1, max: 50 }).withMessage("name is required and must be <= 50 chars"),
  body("primaryMuscle").isString().trim().isLength({ min: 1 }).withMessage("primaryMuscle is required"),
  body("category").isIn(["compound", "isolation"]).withMessage("category must be 'compound' or 'isolation'"),
  body("movementPattern").isString().trim().isLength({ min: 1 }).withMessage("movementPattern is required"),
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
 * @route   GET /api/v1/exercises
 * @desc    Get all exercises with optional filtering and pagination
 * @access  Public
 * @query   page, limit, muscle, equipment, category, search
 */
router.get("/", exerciseController.getExercises);

/**
 * @route   GET /api/v1/exercises/:id
 * @desc    Get single exercise by ID
 * @access  Public
 */
router.get("/:id", exerciseController.getExerciseById);

// ============================================
// PROTECTED ROUTES
// ============================================

/**
 * @route   POST /api/v1/exercises
 * @desc    Create new exercise
 * @access  Private
 * @body    { name, equipment, primaryMuscle, category, movementPattern, ... }
 */
router.post(
  "/",
  verifyToken,
  requiredRole("admin"),
  validateExercise,
  exerciseController.createExercise
);

/**
 * @route   PATCH /api/v1/exercises/:id
 * @desc    Partial update exercise
 * @access  Private
 * @body    Partial exercise fields
 */
router.patch(
  "/:id",
  verifyToken,
  requiredRole("admin"),
  exerciseController.updateExercise
);

/**
 * @route   DELETE /api/v1/exercises/:id
 * @desc    Soft delete exercise (set isActive: false)
 * @access  Private
 */
router.delete(
  "/:id",
  verifyToken,
  requiredRole("admin"),
  exerciseController.deleteExercise
);

module.exports = router;
