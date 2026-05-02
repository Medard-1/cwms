'use strict';

const db = require('../db');

/** @param {import('express').Response} res @param {Error} err */
const sendError = (res, err) => res.status(500).json({error: err.message});

/**
 * GET /api/alerts
 * Returns all alerts joined with child names.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getAll = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT a.*, c.name AS child_name
       FROM alerts a
       JOIN children c ON a.child_id = c.id
       ORDER BY a.created_at DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * GET /api/alerts/unread
 * Returns all unread alerts joined with child names.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getUnread = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT a.*, c.name AS child_name
       FROM alerts a
       JOIN children c ON a.child_id = c.id
       WHERE a.is_read = false
       ORDER BY a.created_at DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * POST /api/alerts
 * Creates a new alert.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.create = async (req, res) => {
  try {
    const {child_id, message, severity} = req.body;
    const result = await db.query(
      `INSERT INTO alerts (child_id, message, severity)
       VALUES ($1, $2, $3) RETURNING *`,
      [child_id, message, severity || 'Medium'],
    );
    res.status(201).json({
      id: result.rows[0].id,
      message: 'Alert created successfully.',
    });
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * PUT /api/alerts/:id/read
 * Marks an alert as read.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.markRead = async (req, res) => {
  try {
    await db.query(
      'UPDATE alerts SET is_read = true WHERE id = $1',
      [req.params.id],
    );
    res.json({message: 'Alert marked as read.'});
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * DELETE /api/alerts/:id
 * Deletes an alert.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.delete = async (req, res) => {
  try {
    await db.query('DELETE FROM alerts WHERE id = $1', [req.params.id]);
    res.json({message: 'Alert deleted successfully.'});
  } catch (err) {
    sendError(res, err);
  }
};
