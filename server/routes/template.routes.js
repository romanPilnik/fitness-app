const express = require("express");
const { verifyToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorize");

const router = express.Router();

// TODO: Import controller when created
// const templateController = require('../controllers/template.controller');

// ============================================
// TEMPLATE COLLECTION
// ============================================

/**
 * @route   GET /api/v1/programs/templates
 * @desc    List all templates (public) - filterable, paginated
 * @access  Public
 * @query   page, limit, splitType, daysPerWeek, difficulty, goals, search
 */
router.get("/", async (req, res) => {});

/**
 * @route   POST /api/v1/programs/templates
 * @desc    Create new template
 * @access  Private - admin only
 * @body    { name, splitType, daysPerWeek, difficulty, goals, createdBy ... }
 */
router.post("/", verifyToken, requireRole("admin"), async (req, res) => {});

// ============================================
// TEMPLATE RESOURCE
// ============================================

/**
 * @route   GET /api/v1/programs/templates/:id
 * @desc    Get single template by ID
 * @access  Public
 */
router.get("/:id", async (req, res) => {});

/**
 * @route   PATCH /api/v1/programs/templates/:id
 * @desc    Partial template update
 * @access  Private - admin only
 * @body    Fields to update
 */
router.patch("/:id", verifyToken, requireRole("admin"), async (req, res) => {});

/**
 * @route   DELETE /api/v1/programs/templates/:id
 * @desc    Permanently delete template from database
 * @access  Private - admin only
 */
router.delete(
  "/:id",
  verifyToken,
  requireRole("admin"),
  async (req, res) => {}
);

module.exports = router;
