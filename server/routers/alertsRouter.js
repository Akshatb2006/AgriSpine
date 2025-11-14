const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const AlertsController = require('../controllers/alertsController');

router.get('/', auth, AlertsController.getAll);
router.put('/:id/read', auth, AlertsController.markRead);
router.post('/subscribe', auth, AlertsController.subscribe);

module.exports = router;


