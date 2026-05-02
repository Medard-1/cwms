'use strict';

const CaseService = require('../models/caseModel');
const runAutoAlerts = require('../autoAlert');
const db = require('../db');

/** @param {import('express').Response} res @param {Error} err */
const sendError = (res, err) => res.status(500).json({error: err.message});

/**
 * GET /api/cases
 * Returns all cases joined with child and assigned worker names.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getAll = async (req, res) => {
  try {
    const result = await CaseService.getAll();
    res.json(result.rows);
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * GET /api/cases/:id
 * Returns a single case by ID.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getById = async (req, res) => {
  try {
    const result = await CaseService.getById(req.params.id);
    if (!result.rows.length) {
      return res.status(404).json({error: 'Case not found.'});
    }
    res.json(result.rows[0]);
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * GET /api/cases/assigned/:userId
 * Returns all cases assigned to a specific social worker.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getByAssignedUser = async (req, res) => {
  try {
    const result = await CaseService.getByAssignedUser(req.params.userId);
    res.json(result.rows);
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * POST /api/cases
 * Creates a new welfare case and triggers auto-alert checks.
 * If case type is abuse-related, creates a High severity alert immediately.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.create = async (req, res) => {
  try {
    const result = await CaseService.create(req.body);
    const newCase = result.rows[0];

    // Auto-create High alert for abuse-related cases immediately.
    const abuseTypes = ['Abuse', 'Neglect', 'Abandonment', 'Family Crisis'];
    if (abuseTypes.includes(req.body.case_type)) {
      const childResult = await db.query(
        'SELECT name FROM children WHERE id = $1',
        [req.body.child_id],
      );
      const childName = childResult.rows[0]?.name || 'A child';
      await db.query(
        `INSERT INTO alerts (child_id, message, severity)
         VALUES ($1, $2, $3)`,
        [
          req.body.child_id,
          `URGENT: ${req.body.case_type} case reported for ${childName}. Immediate action required.`,
          'High',
        ],
      );
    }

    runAutoAlerts();
    res.status(201).json({
      id: newCase.id,
      message: 'Case created successfully.',
    });
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * PUT /api/cases/:id
 * Updates an existing case and triggers auto-alert checks.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.update = async (req, res) => {
  try {
    await CaseService.update(req.params.id, req.body);
    runAutoAlerts();
    res.json({message: 'Case updated successfully.'});
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * DELETE /api/cases/:id
 * Deletes a welfare case.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.delete = async (req, res) => {
  try {
    await CaseService.delete(req.params.id);
    res.json({message: 'Case deleted successfully.'});
  } catch (err) {
    sendError(res, err);
  }
};
