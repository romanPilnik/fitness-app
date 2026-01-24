/**
 * @fileoverview Authentication routes for user registration and login
 * @module routes/auth
 */

const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const authValidation = require('../validations/auth.validation');

const authRouter = express.Router();

/**
 * POST /api/auth/register
 * @route POST /register
 * @group Authentication - User authentication operations
 * @param {string} email.body.required - User's email address
 * @param {string} password.body.required - User's password (min 8 characters)
 * @param {string} name.body.required - User's full name
 * @returns {Object} 201 - User created successfully with JWT token
 * @returns {Object} 409 - User already exists
 * @returns {Object} 400 - Validation error
 */
authRouter.post('/register', validate(authValidation.registerUser), authController.registerUser);

/**
 * POST /api/auth/login
 * @route POST /login
 * @group Authentication - User authentication operations
 * @param {string} email.body.required - User's email address
 * @param {string} password.body.required - User's password
 * @returns {Object} 200 - Login successful with JWT token
 * @returns {Object} 401 - Invalid credentials
 */
authRouter.post('/login', validate(authValidation.loginUser), authController.loginUser);

module.exports = authRouter;
