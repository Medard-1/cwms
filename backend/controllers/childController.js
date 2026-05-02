'use strict';

const ChildService = require('../models/childModel');
const runAutoAlerts = require('../autoAlert');

/**
 * Sends a 500 error response with the error message.
 * @param {import('express').Response} res
 * @param {Error} err
 */
const sendError = (res, err) => res.status(500).json({error: err.message});

/**
 * GET /api/children
 * Returns all registered children.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getAll = async (req, res) => {
  try {
    const result = await ChildService.getAll();
    res.json(result.rows);
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * GET /api/children/:id
 * Returns a single child by ID.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getById = async (req, res) => {
  try {
    const result = await ChildService.getById(req.params.id);
    if (!result.rows.length) {
      return res.status(404).json({error: 'Child not found.'});
    }
    res.json(result.rows[0]);
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * POST /api/children
 * Registers a new child and triggers auto-alert checks.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.create = async (req, res) => {
  try {
    const result = await ChildService.create(req.body);
    runAutoAlerts();
    res.status(201).json({
      id: result.rows[0].id,
      message: 'Child registered successfully.',
    });
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * PUT /api/children/:id
 * Updates an existing child record and triggers auto-alert checks.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.update = async (req, res) => {
  try {
    await ChildService.update(req.params.id, req.body);
    runAutoAlerts();
    res.json({message: 'Child updated successfully.'});
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * DELETE /api/children/:id
 * Deletes a child record.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.delete = async (req, res) => {
  try {
    await ChildService.delete(req.params.id);
    res.json({message: 'Child deleted successfully.'});
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * GET /api/children/stats
 * Returns the total count of registered children.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getStats = async (req, res) => {
  try {
    const result = await ChildService.count();
    res.json(result.rows[0]);
  } catch (err) {
    sendError(res, err);
  }
};
