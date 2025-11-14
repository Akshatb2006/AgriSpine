// server/routers/authRouter.js - Complete Updated Version
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const AuthController = require('../controllers/authController');

// Authentication routes
router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);

// Onboarding routes
router.post('/complete-onboarding', auth, AuthController.completeOnboarding);

// NEW: Initialization routes (for AI-powered setup)
router.post('/initialize-farm', auth, AuthController.initializeFarm);
router.get('/initialization-status/:jobId', auth, AuthController.getInitializationStatus);

// Profile routes
router.get('/profile', auth, AuthController.getProfile);
router.put('/profile', auth, AuthController.updateProfile);

module.exports = router;