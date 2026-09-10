const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/demo-accounts', authController.getDemoCredentials);

// Protected route
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
