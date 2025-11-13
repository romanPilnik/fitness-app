const express = require('express');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/v1/profile/exercises/
router.get('/', verifyToken, async (req, res) => {});

// GET /api/v1/profile/exercises/:exerciseId
router.get('/:exerciseId', verifyToken, async (req, res) => {});

// PATCH /api/v1/profile/exercises/:exerciseId
router.patch('/:exerciseId', verifyToken, async (req, res) => {});

module.exports = router;
