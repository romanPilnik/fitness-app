const express = require('express');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// GET api/v1/sessions/
router.get('/', verifyToken, async (req, res) => {});

// GET api/v1/sessions/:sessionId
router.get('/:sessionId', verifyToken, async (req, res) => {});

// DELETE api/v1/sessions/:sessionId
router.delete('/:sessionId', verifyToken, async (req, res) => {});

module.exports = router;
