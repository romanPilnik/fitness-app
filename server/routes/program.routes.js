const express = require("express");
const { verifyToken } = require("../middleware/auth");
const { verifyOwnership } = require("../middleware/ownership");
const UserProgram = require("../models/UserProgram");

const router = express.Router();

// TODO: Import controller when created
// const programController = require('../controllers/program.controller');

// All user program routes require authentication
router.use(verifyToken);

// ============================================
// PROGRAM COLLECTION
// ============================================

/**
 * @route   GET /api/v1/programs
 * @desc    Get user's programs (all or filtered by status)
 * @access  Private
 * @query   page, limit, status (active/paused/completed)
 */
router.get("/", async (req, res) => {});

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

// ============================================
// CONVENIENCE ROUTES
// ============================================

/**
 * @route   GET /api/v1/programs/active
 * @desc    Get user's currently active program (convenience endpoint)
 * @access  Private
 */
router.get("/active", async (req, res) => {});

// ============================================
// PROGRAM RESOURCE
// ============================================

/**
 * @route   GET /api/v1/programs/:id
 * @desc    Get single program by ID (with ownership check)
 * @access  Private
 */
router.get("/:id", verifyOwnership(UserProgram), async (req, res) => {});

/**
 * @route   PATCH /api/v1/programs/:id
 * @desc    Partial update program
 * @access  Private
 * @body    Fields to update
 */
router.patch("/:id", verifyOwnership(UserProgram), async (req, res) => {});

/**
 * @route   DELETE /api/v1/programs/:id
 * @desc    Delete user program
 * @access  Private
 */
router.delete("/:id", verifyOwnership(UserProgram), async (req, res) => {});

module.exports = router;
