'use strict';

const db = require('../db');

/** @param {import('express').Response} res @param {Error} err */
const sendError = (res, err) => res.status(500).json({error: err.message});

/**
 * GET /api/messages/inbox/:userId
 * Returns all messages received by a user.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getInbox = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT m.*, u.full_name AS sender_name, u.role AS sender_role
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.receiver_id = $1
       ORDER BY m.created_at DESC`,
      [req.params.userId],
    );
    res.json(result.rows);
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * GET /api/messages/sent/:userId
 * Returns all messages sent by a user.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getSent = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT m.*, u.full_name AS receiver_name, u.role AS receiver_role
       FROM messages m
       JOIN users u ON m.receiver_id = u.id
       WHERE m.sender_id = $1
       ORDER BY m.created_at DESC`,
      [req.params.userId],
    );
    res.json(result.rows);
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * GET /api/messages/unread-count/:userId
 * Returns count of unread messages for a user.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT COUNT(*) AS count FROM messages WHERE receiver_id = $1 AND is_read = false',
      [req.params.userId],
    );
    res.json(result.rows[0]);
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * POST /api/messages
 * Sends a new message from one user to another.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.send = async (req, res) => {
  try {
    const {sender_id, receiver_id, subject, body} = req.body;
    if (!sender_id || !receiver_id || !subject || !body) {
      return res.status(400).json({error: 'All fields are required.'});
    }
    const result = await db.query(
      `INSERT INTO messages (sender_id, receiver_id, subject, body)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [sender_id, receiver_id, subject, body],
    );
    res.status(201).json({id: result.rows[0].id, message: 'Message sent successfully.'});
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * PUT /api/messages/:id/read
 * Marks a message as read.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.markRead = async (req, res) => {
  try {
    await db.query('UPDATE messages SET is_read = true WHERE id = $1', [req.params.id]);
    res.json({message: 'Message marked as read.'});
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * DELETE /api/messages/:id
 * Deletes a message.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.delete = async (req, res) => {
  try {
    await db.query('DELETE FROM messages WHERE id = $1', [req.params.id]);
    res.json({message: 'Message deleted successfully.'});
  } catch (err) {
    sendError(res, err);
  }
};
