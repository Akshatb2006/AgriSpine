// server/routers/fieldsRouter.js (Updated)
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const FieldsController = require('../controllers/fieldsController');

router.get('/', auth, FieldsController.getAll);
router.get('/:id', auth, FieldsController.getOne);
router.post('/', auth, FieldsController.create);
router.put('/:id', auth, FieldsController.update);
router.delete('/:id', auth, FieldsController.delete);

module.exports = router;