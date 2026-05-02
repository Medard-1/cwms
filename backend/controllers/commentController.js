'use strict';

const db = require('../db');

/** @param {import('express').Response} res @param {Error} err */
const sendError = (res, err) => res.status(500).json({error: err.message});

/**
 * GET /api/comments/:caseId
 * Returns all comments for a specific case.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getByCaseId = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT cc.*, u.full_name AS user_name, u.role AS user_role
       FROM case_comments cc
       JOIN users u ON cc.user_id = u.id
       WHERE cc.case_id = $1
       ORDER BY cc.created_at ASC`,
      [req.params.caseId],
    );
    res.json(result.rows);
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * POST /api/comments
 * Adds a new comment to a case.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.create = async (req, res) => {
  try {
    const {case_id, user_id, comment} = req.body;
    if (!case_id || !user_id || !comment) {
      return res.status(400).json({error: 'case_id, user_id and comment are required.'});
    }
    const result = await db.query(
      `INSERT INTO case_comments (case_id, user_id, comment)
       VALUES ($1, $2, $3) RETURNING *`,
      [case_id, user_id, comment],
    );
    res.status(201).json({id: result.rows[0].id, message: 'Comment added successfully.'});
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * DELETE /api/comments/:id
 * Deletes a comment.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.delete = async (req, res) => {
  try {
    await db.query('DELETE FROM case_comments WHERE id = $1', [req.params.id]);
    res.json({message: 'Comment deleted successfully.'});
  } catch (err) {
    sendError(res, err);
  }
};
