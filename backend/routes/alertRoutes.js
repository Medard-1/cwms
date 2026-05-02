'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/alertController');

router.get('/', ctrl.getAll);
router.get('/unread', ctrl.getUnread);
router.post('/', ctrl.create);
router.put('/:id/read', ctrl.markRead);
router.delete('/:id', ctrl.delete);

module.exports = router;
