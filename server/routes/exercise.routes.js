const express = require("express");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// TODO: Import controller when created
// const exerciseController = require('../controllers/exercise.controller');

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @route   GET /api/v1/exercises
 * @desc    Get all exercises with optional filtering and pagination
 * @access  Public
 * @query   page, limit, muscle, equipment, category, search
 */
router.get("/", async (req, res) => {
  // TODO: Move to exerciseController.getExercises
  res.json({ message: "Get all exercises - controller pending" });
});

/**
 * @route   GET /api/v1/exercises/:id
 * @desc    Get single exercise by ID
 * @access  Public
 */
router.get("/:id", async (req, res) => {
  // TODO: Move to exerciseController.getExerciseById
  res.json({ message: "Get exercise by ID - controller pending" });
});

// ============================================
// PROTECTED ROUTES
// ============================================

router.use(verifyToken);

/**
 * @route   POST /api/v1/exercises
 * @desc    Create new exercise
 * @access  Private (later: Admin only)
 * @body    { name, equipment, primaryMuscle, category, movementPattern, ... }
 */
router.post("/", async (req, res) => {
  // TODO: Add validation middleware
  // TODO: Move to exerciseController.createExercise
  res.json({ message: "Create exercise - controller pending" });
});

/**
 * @route   PUT /api/v1/exercises/:id
 * @desc    Update exercise (full update)
 * @access  Private (later: Admin only)
 * @body    Complete exercise object
 */
router.put("/:id", async (req, res) => {
  // TODO: Add validation middleware
  // TODO: Move to exerciseController.updateExercise
  res.json({ message: "Update exercise - controller pending" });
});

/**
 * @route   PATCH /api/v1/exercises/:id
 * @desc    Partial update exercise (e.g., deactivate)
 * @access  Private (later: Admin only)
 * @body    Partial exercise fields
 */
router.patch("/:id", async (req, res) => {
  // TODO: Move to exerciseController.patchExercise
  res.json({ message: "Patch exercise - controller pending" });
});

/**
 * @route   DELETE /api/v1/exercises/:id
 * @desc    Soft delete exercise (set isActive: false)
 * @access  Private (later: Admin only)
 */
router.delete("/:id", async (req, res) => {
  // TODO: Move to exerciseController.deleteExercise
  res.json({ message: "Delete exercise - controller pending" });
});

module.exports = router;
