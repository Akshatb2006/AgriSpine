const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const TasksController = require('../controllers/tasksController');

router.get('/', auth, TasksController.getAll);
router.post('/', auth, TasksController.create);
router.put('/:id/status', auth, TasksController.updateStatus);

module.exports = router;


