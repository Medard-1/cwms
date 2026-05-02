'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/educationController');

router.get('/', ctrl.getAll);
router.get('/child/:child_id', ctrl.getByChild);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);

module.exports = router;
