const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const PlansController = require('../controllers/plansController');

router.get('/', auth, PlansController.getAll);
router.get('/:id', auth, PlansController.getOne);
router.get('/:id/status', auth, PlansController.getStatus); 
router.post('/', auth, PlansController.create);
router.put('/:id', auth, PlansController.update);
router.delete('/:id', auth, PlansController.delete);

router.put('/:id/tasks/:taskId/status', auth, PlansController.updateTaskStatus);
router.post('/:id/tasks', auth, PlansController.addTask);
router.put('/:id/tasks/:taskId', auth, PlansController.updateTask);
router.delete('/:id/tasks/:taskId', auth, PlansController.deleteTask);

module.exports = router;