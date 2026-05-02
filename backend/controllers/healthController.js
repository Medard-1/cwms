'use strict';

const db = require('../db');
const runAutoAlerts = require('../autoAlert');

/** @param {import('express').Response} res @param {Error} err */
const sendError = (res, err) => res.status(500).json({error: err.message});

/**
 * GET /api/health
 * Returns all health records joined with child names.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getAll = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT h.*, c.name AS child_name
       FROM health_records h
       JOIN children c ON h.child_id = c.id
       ORDER BY h.created_at DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * GET /api/health/child/:child_id
 * Returns all health records for a specific child.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getByChild = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM health_records WHERE child_id = $1',
      [req.params.child_id],
    );
    res.json(result.rows);
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * POST /api/health
 * Creates a new health record and triggers auto-alert checks.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.create = async (req, res) => {
  try {
    const {child_id, condition_name, treatment, visit_date} = req.body;
    const result = await db.query(
      `INSERT INTO health_records (child_id, condition_name, treatment, visit_date)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [child_id, condition_name, treatment || '', visit_date],
    );
    runAutoAlerts();
    res.status(201).json({
      id: result.rows[0].id,
      message: 'Health record added successfully.',
    });
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * PUT /api/health/:id
 * Updates an existing health record and triggers auto-alert checks.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.update = async (req, res) => {
  try {
    const {child_id, condition_name, treatment, visit_date} = req.body;
    await db.query(
      `UPDATE health_records
       SET child_id = $1, condition_name = $2, treatment = $3, visit_date = $4
       WHERE id = $5`,
      [child_id, condition_name, treatment, visit_date, req.params.id],
    );
    runAutoAlerts();
    res.json({message: 'Health record updated successfully.'});
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * DELETE /api/health/:id
 * Deletes a health record and triggers auto-alert checks.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.delete = async (req, res) => {
  try {
    await db.query('DELETE FROM health_records WHERE id = $1', [req.params.id]);
    runAutoAlerts();
    res.json({message: 'Health record deleted successfully.'});
  } catch (err) {
    sendError(res, err);
  }
};
