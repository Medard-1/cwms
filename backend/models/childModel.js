'use strict';

const db = require('../db');

/**
 * @typedef {Object} Child
 * @property {number} id
 * @property {string} name
 * @property {number} age
 * @property {string} gender
 * @property {string} guardian
 * @property {string} status
 */

/**
 * Reusable data-access service for the children table.
 * Used by childController across all child-related operations.
 * @namespace ChildService
 */
const ChildService = {
  /** @return {Promise} All children ordered by creation date. */
  getAll: () => db.query(
    'SELECT * FROM children ORDER BY created_at DESC',
  ),

  /**
   * @param {number} id - Child ID.
   * @return {Promise} Single child row.
   */
  getById: (id) => db.query(
    'SELECT * FROM children WHERE id = $1',
    [id],
  ),

  /**
   * @param {Child} child - Child data.
   * @return {Promise} Inserted child row.
   */
  create: ({name, age, gender, guardian, status}) => db.query(
    `INSERT INTO children (name, age, gender, guardian, status)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, age, gender, guardian, status || 'Active'],
  ),

  /**
   * @param {number} id - Child ID.
   * @param {Child} child - Updated child data.
   * @return {Promise} Updated child row.
   */
  update: (id, {name, age, gender, guardian, status}) => db.query(
    `UPDATE children
     SET name = $1, age = $2, gender = $3, guardian = $4, status = $5
     WHERE id = $6 RETURNING *`,
    [name, age, gender, guardian, status, id],
  ),

  /**
   * @param {number} id - Child ID.
   * @return {Promise}
   */
  delete: (id) => db.query(
    'DELETE FROM children WHERE id = $1',
    [id],
  ),

  /** @return {Promise} Total count of children. */
  count: () => db.query('SELECT COUNT(*) AS total FROM children'),
};

module.exports = ChildService;
