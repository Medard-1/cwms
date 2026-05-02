'use strict';

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/messageController');
const {verifyToken} = require('../middleware/authMiddleware');

router.get('/inbox/:userId', verifyToken, ctrl.getInbox);
router.get('/sent/:userId', verifyToken, ctrl.getSent);
router.get('/unread-count/:userId', verifyToken, ctrl.getUnreadCount);
router.post('/', verifyToken, ctrl.send);
router.put('/:id/read', verifyToken, ctrl.markRead);
router.delete('/:id', verifyToken, ctrl.delete);

module.exports = router;
