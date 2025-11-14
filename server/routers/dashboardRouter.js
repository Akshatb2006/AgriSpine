// server/routers/dashboardRouter.js (Add new routes)
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const DashboardController = require('../controllers/dashboardController');

router.get('/overview', auth, DashboardController.getOverview);
router.get('/alerts', auth, DashboardController.getAlerts);
router.get('/recent-tasks', auth, DashboardController.getRecentTasks);
router.get('/field/:fieldId', auth, DashboardController.getFieldOverview);

module.exports = router;