const express = require('express');
const { verifyToken } = require('../middleware/auth');

const exerciseProfileRouter = express.Router();

// GET /api/v1/profile/exercises/
exerciseProfileRouter.get('/', verifyToken, async (req, res) => {});

// GET /api/v1/profile/exercises/:exerciseId
exerciseProfileRouter.get('/:exerciseId', verifyToken, async (req, res) => {});

// PATCH /api/v1/profile/exercises/:exerciseId
exerciseProfileRouter.patch('/:exerciseId', verifyToken, async (req, res) => {});

module.exports = exerciseProfileRouter;
