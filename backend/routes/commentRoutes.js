'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/commentController');
const {verifyToken} = require('../middleware/authMiddleware');

router.get('/:caseId', verifyToken, ctrl.getByCaseId);
router.post('/', verifyToken, ctrl.create);
router.delete('/:id', verifyToken, ctrl.delete);

module.exports = router;
