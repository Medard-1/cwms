'use strict';

const db = require('../db');
const runAutoAlerts = require('../autoAlert');

/** @param {import('express').Response} res @param {Error} err */
const sendError = (res, err) => res.status(500).json({error: err.message});

/**
 * GET /api/education
 * Returns all education records joined with child names.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getAll = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT e.*, c.name AS child_name
       FROM education_records e
       JOIN children c ON e.child_id = c.id
       ORDER BY e.created_at DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * GET /api/education/child/:child_id
 * Returns all education records for a specific child.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getByChild = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM education_records WHERE child_id = $1',
      [req.params.child_id],
    );
    res.json(result.rows);
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * POST /api/education
 * Creates a new education record and triggers auto-alert checks.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.create = async (req, res) => {
  try {
    const {child_id, school_name, grade, performance, year} = req.body;
    const result = await db.query(
      `INSERT INTO education_records (child_id, school_name, grade, performance, year)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [child_id, school_name, grade, performance || '', year],
    );
    runAutoAlerts();
    res.status(201).json({
      id: result.rows[0].id,
      message: 'Education record added successfully.',
    });
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * PUT /api/education/:id
 * Updates an existing education record and triggers auto-alert checks.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.update = async (req, res) => {
  try {
    const {child_id, school_name, grade, performance, year} = req.body;
    await db.query(
      `UPDATE education_records
       SET child_id = $1, school_name = $2, grade = $3, performance = $4, year = $5
       WHERE id = $6`,
      [child_id, school_name, grade, performance, year, req.params.id],
    );
    runAutoAlerts();
    res.json({message: 'Education record updated successfully.'});
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * DELETE /api/education/:id
 * Deletes an education record and triggers auto-alert checks.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.delete = async (req, res) => {
  try {
    await db.query(
      'DELETE FROM education_records WHERE id = $1',
      [req.params.id],
    );
    runAutoAlerts();
    res.json({message: 'Education record deleted successfully.'});
  } catch (err) {
    sendError(res, err);
  }
};
