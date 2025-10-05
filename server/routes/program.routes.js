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
 * @desc    Get all templates with optional filtering and pagination
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
// PROGRAM TEMPLATES - PROTECTED
// ============================================

router.use(verifyToken);

/**
 * @route   POST /api/v1/programs/templates
 * @desc    Create new template
 * @access  Private (later: Admin only)
 * @body    { name, splitType, daysPerWeek, difficulty, goals, createdBy ... }
 */
router.get("/templates", (req, res) => {});

// ============================================
// USER PROGRAMS - PROTECTED
// ============================================

/**
 * @route   GET /api/v1/programs/my-programs
 * @desc    Get all of users programs with optional queries and pagination
 * @access  Private
 * @query    { name, splitType, daysPerWeek, difficulty, goals, createdBy ... }
 */
router.get("/my-programs", (req, res) => {});

/**
 * @route   GET /api/v1/programs/active
 * @desc    Get all of users active programs with optional queries and pagination
 * @access  Private
 * @query    { name, splitType, daysPerWeek, difficulty, goals, createdBy ... }
 */
router.get("/active", (req, res) => {});

/**
 * @route   GET /api/v1/programs/:id
 * @desc    Get single program by ID
 * @access  Private
 */
router.get("/:id", (req, res) => {});
