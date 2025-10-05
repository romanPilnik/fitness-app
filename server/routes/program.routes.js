const express = require("express");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// TODO: Import controller when created
// const programController = require('../controllers/program.controller');

// ============================================
// PROGRAM TEMPLATES - PUBLIC
// ============================================

/**
 * @route   GET /api/v1/programs/templates
 * @desc    List all templates (public) - filterable, paginated
 * @access  Public
 * @query   page, limit, splitType, daysPerWeek, difficulty, goals, search
 */
router.get("/templates", async (req, res) => {});

/**
 * @route   GET /api/v1/programs/templates/:id
 * @desc    Get single template by ID
 * @access  Public
 */
router.get("/templates/:id", async (req, res) => {});

// ============================================
// PROGRAM TEMPLATES - PROTECTED (Admin)
// ============================================

router.use(verifyToken);

/**
 * @route   POST /api/v1/programs/templates
 * @desc    Create new template
 * @access  Private (later: Admin only)
 * @body    { name, splitType, daysPerWeek, difficulty, goals, createdBy ... }
 */
router.post("/templates", async (req, res) => {});

/**
 * @route   PUT /api/v1/programs/templates/:id
 * @desc    Update template (full replacement)
 * @access  Private (later: Admin only)
 * @body    Complete template object
 */
router.put("/templates/:id", async (req, res) => {});

/**
 * @route   PATCH /api/v1/programs/templates/:id
 * @desc    Partial template update
 * @access  Private (later: Admin only)
 * @body    Fields to update
 */
router.patch("/templates/:id", async (req, res) => {});

/**
 * @route   PATCH /api/v1/programs/templates/:id/status
 * @desc    Deactivate template (set isActive: false)
 * @access  Private (later: Admin only)
 * @body    { isActive: false }
 */
router.patch("/templates/:id/status", async (req, res) => {});

/**
 * @route   DELETE /api/v1/programs/templates/:id
 * @desc    Permanently delete template from database
 * @access  Private (later: Admin only)
 */
router.delete("/templates/:id", async (req, res) => {});

// ============================================
// USER PROGRAMS - PROTECTED
// ============================================

/**
 * @route   GET /api/v1/programs/my-programs
 * @desc    Get user's programs (all or filtered by status)
 * @access  Private
 * @query   page, limit, status (active/paused/completed)
 */
router.get("/my-programs", async (req, res) => {});

/**
 * @route   GET /api/v1/programs/active
 * @desc    Get user's currently active program (convenience endpoint)
 * @access  Private
 */
router.get("/active", async (req, res) => {});

/**
 * @route   GET /api/v1/programs/:id
 * @desc    Get single program by ID (with ownership check)
 * @access  Private
 */
router.get("/:id", async (req, res) => {});

/**
 * @route   POST /api/v1/programs/from-template
 * @desc    Create user program from template
 * @access  Private
 * @body    { templateId, customizations (optional) }
 */
router.post("/from-template", async (req, res) => {});

/**
 * @route   POST /api/v1/programs/custom
 * @desc    Create custom program from scratch
 * @access  Private
 * @body    { name, splitType, workouts, periodization, ... }
 */
router.post("/custom", async (req, res) => {});

/**
 * @route   PUT /api/v1/programs/:id
 * @desc    Update program structure (full replacement)
 * @access  Private
 * @body    Complete program object
 */
router.put("/:id", async (req, res) => {});

/**
 * @route   PATCH /api/v1/programs/:id
 * @desc    Partial update program
 * @access  Private
 * @body    Fields to update
 */
router.patch("/:id", async (req, res) => {});

/**
 * @route   PATCH /api/v1/programs/:id/status
 * @desc    Change program status (pause/resume/complete)
 * @access  Private
 * @body    { status: "active" | "paused" | "completed" }
 */
router.patch("/:id/status", async (req, res) => {});

/**
 * @route   DELETE /api/v1/programs/:id
 * @desc    Delete user program
 * @access  Private
 */
router.delete("/:id", async (req, res) => {});

module.exports = router;
