// server/routers/predictionsRouter.js - ENHANCED VERSION
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const PredictionsController = require('../controllers/predictionsController');

// Get all predictions with filters
router.get('/', auth, PredictionsController.getAllPredictions);

// Get prediction history (legacy endpoint, kept for compatibility)
router.get('/history', auth, PredictionsController.getHistory);

// Create new yield prediction
router.post('/yield', auth, PredictionsController.createYield);

// Get specific yield prediction by ID
router.get('/yield/:id', auth, PredictionsController.getYield);

// Create scheduled prediction (NEW)
router.post('/schedule', auth, PredictionsController.createScheduledPrediction);

// Process pending predictions (NEW - can be called manually or by cron)
router.post('/process-pending', auth, PredictionsController.processPendingPredictions);

// Disease detection
router.post('/disease-detection', auth, PredictionsController.diseaseDetection);

module.exports = router;