'use strict';

const db = require('../db');

/**
 * Reusable data-access service for the cases table.
 * Used by caseController across all case-related operations.
 * @namespace CaseService
 */
const CaseService = {
  /** @return {Promise} All cases joined with child name and assigned worker name. */
  getAll: () => db.query(
    `SELECT cases.*,
            children.name AS child_name,
            users.full_name AS assigned_to_name
     FROM cases
     JOIN children ON cases.child_id = children.id
     LEFT JOIN users ON cases.assigned_to = users.id
     ORDER BY cases.created_at DESC`,
  ),

  /**
   * @param {number} id - Case ID.
   * @return {Promise} Single case row.
   */
  getById: (id) => db.query(
    `SELECT cases.*,
            children.name AS child_name,
            users.full_name AS assigned_to_name
     FROM cases
     JOIN children ON cases.child_id = children.id
     LEFT JOIN users ON cases.assigned_to = users.id
     WHERE cases.id = $1`,
    [id],
  ),

  /**
   * @param {number} childId - Child ID.
   * @return {Promise} All cases for a child.
   */
  getByChild: (childId) => db.query(
    'SELECT * FROM cases WHERE child_id = $1',
    [childId],
  ),

  /**
   * @param {number} userId - User ID of the assigned social worker.
   * @return {Promise} All cases assigned to a specific user.
   */
  getByAssignedUser: (userId) => db.query(
    `SELECT cases.*,
            children.name AS child_name
     FROM cases
     JOIN children ON cases.child_id = children.id
     WHERE cases.assigned_to = $1
     ORDER BY cases.created_at DESC`,
    [userId],
  ),

  /**
   * @param {{child_id, case_type, description, status, assigned_to, urgency_level, reported_by}} data
   * @return {Promise} Inserted case row.
   */
  create: ({child_id, case_type, description, status, assigned_to, urgency_level, reported_by}) =>
    db.query(
      `INSERT INTO cases
         (child_id, case_type, description, status, assigned_to, urgency_level, reported_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        child_id,
        case_type,
        description || '',
        status || 'Open',
        assigned_to || null,
        urgency_level || 'Normal',
        reported_by || 'System',
      ],
    ),

  /**
   * @param {number} id - Case ID.
   * @param {{child_id, case_type, description, status, assigned_to, urgency_level, reported_by}} data
   * @return {Promise} Updated case row.
   */
  update: (id, {child_id, case_type, description, status, assigned_to, urgency_level, reported_by}) =>
    db.query(
      `UPDATE cases
       SET child_id = $1, case_type = $2, description = $3, status = $4,
           assigned_to = $5, urgency_level = $6, reported_by = $7
       WHERE id = $8 RETURNING *`,
      [child_id, case_type, description, status, assigned_to || null, urgency_level, reported_by, id],
    ),

  /**
   * @param {number} id - Case ID.
   * @return {Promise}
   */
  delete: (id) => db.query('DELETE FROM cases WHERE id = $1', [id]),

  /** @return {Promise} Total count of cases. */
  count: () => db.query('SELECT COUNT(*) AS total FROM cases'),
};

module.exports = CaseService;
