'use strict';

const db = require('./db');

/**
 * Inserts an alert only if no identical unread alert exists for the child.
 * @param {number} childId - The ID of the child.
 * @param {string} message - The alert message.
 * @param {string} severity - Severity level: 'Low', 'Medium', or 'High'.
 * @return {Promise<void>}
 */
async function createAlertIfNotExists(childId, message, severity) {
  const existing = await db.query(
    'SELECT id FROM alerts WHERE child_id = $1 AND message = $2 AND is_read = false',
    [childId, message],
  );

  if (existing.rows.length === 0) {
    await db.query(
      'INSERT INTO alerts (child_id, message, severity) VALUES ($1, $2, $3)',
      [childId, message, severity],
    );
  }
}

/**
 * Runs all automated welfare alert checks for every registered child.
 * Checks include: missing health/education records, status flags,
 * open cases, poor academic performance, and overdue health visits.
 * @return {Promise<void>}
 */
async function runAutoAlerts() {
  try {
    const {rows: children} = await db.query('SELECT * FROM children');

    for (const child of children) {
      const {id, name, status} = child;

      // Check 1: No health records on file.
      const {rows: healthRows} = await db.query(
        'SELECT id FROM health_records WHERE child_id = $1',
        [id],
      );
      if (healthRows.length === 0) {
        await createAlertIfNotExists(
          id,
          `${name} has no health records on file. Please schedule a medical checkup.`,
          'High',
        );
      }

      // Check 2: No education records on file.
      const {rows: eduRows} = await db.query(
        'SELECT id FROM education_records WHERE child_id = $1',
        [id],
      );
      if (eduRows.length === 0) {
        await createAlertIfNotExists(
          id,
          `${name} has no education records. Please verify school enrollment.`,
          'Medium',
        );
      }

      // Check 3: Child is under review.
      if (status === 'Under Review') {
        await createAlertIfNotExists(
          id,
          `${name} is currently under review. Immediate attention required.`,
          'High',
        );
      }

      // Check 4: Child is inactive.
      if (status === 'Inactive') {
        await createAlertIfNotExists(
          id,
          `${name} is marked as Inactive. Please follow up on their welfare status.`,
          'Medium',
        );
      }

      // Check 5: Open or in-progress cases exist.
      const {rows: openCases} = await db.query(
        `SELECT id FROM cases
         WHERE child_id = $1 AND status IN ('Open', 'In Progress')`,
        [id],
      );
      if (openCases.length > 0) {
        await createAlertIfNotExists(
          id,
          `${name} has ${openCases.length} unresolved case(s) requiring follow-up.`,
          'High',
        );
      }

      // Check 6: Poor or below-average academic performance.
      const {rows: poorEduRows} = await db.query(
        `SELECT id FROM education_records
         WHERE child_id = $1 AND performance IN ('Poor', 'Below Average')`,
        [id],
      );
      if (poorEduRows.length > 0) {
        await createAlertIfNotExists(
          id,
          `${name} is performing poorly academically. Consider educational support.`,
          'Medium',
        );
      }

      // Check 7: Last health visit was over 6 months ago.
      const {rows: oldHealthRows} = await db.query(
        `SELECT id FROM health_records
         WHERE child_id = $1 AND visit_date < NOW() - INTERVAL '6 months'
         ORDER BY visit_date DESC LIMIT 1`,
        [id],
      );
      if (healthRows.length > 0 &&
          oldHealthRows.length > 0 &&
          healthRows.length === oldHealthRows.length) {
        await createAlertIfNotExists(
          id,
          `${name}'s last health visit was over 6 months ago. A checkup is recommended.`,
          'Medium',
        );
      }
    }

    console.log('Auto-alerts checked and updated.');
  } catch (err) {
    console.error('Auto-alert error:', err.message);
  }
}

module.exports = runAutoAlerts;
