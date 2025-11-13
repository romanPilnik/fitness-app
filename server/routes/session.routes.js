const express = require('express');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// GET api/v1/session/
router.get('/', verifyToken, async (req, res) => {});

// POST api/v1/session/
router.post('/', verifyToken, async (req, res) => {});

// GET api/v1/session/:sessionId
router.get('/:sessionId', verifyToken, async (req, res) => {});

// PATCH api/v1/session/:sessionId
router.patch('/:sessionId', verifyToken, async (req, res) => {});

// DELETE api/v1/session/:sessionId
router.delete('/:sessionId', verifyToken, async (req, res) => {});

module.exports = router;
