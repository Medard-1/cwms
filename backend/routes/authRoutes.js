'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const {verifyToken, adminOnly} = require('../middleware/authMiddleware');

router.post('/login', ctrl.login);
router.get('/users', verifyToken, ctrl.getAll);
router.post('/users', verifyToken, adminOnly, ctrl.create);
router.delete('/users/:id', verifyToken, adminOnly, ctrl.delete);

module.exports = router;
