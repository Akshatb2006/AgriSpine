const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const AuthController = require('../controllers/authController');

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);

router.post('/complete-onboarding', auth, AuthController.completeOnboarding);

router.post('/initialize-farm', auth, AuthController.initializeFarm);
router.get('/initialization-status/:jobId', auth, AuthController.getInitializationStatus);

router.get('/profile', auth, AuthController.getProfile);
router.put('/profile', auth, AuthController.updateProfile);

module.exports = router;