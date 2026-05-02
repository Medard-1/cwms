'use strict';

require('dotenv').config();

const bcrypt = require('bcrypt');

const db = require('./backend/db');

/** @const {number} Salt rounds for bcrypt. */
const SALT_ROUNDS = 10;

/**
 * Default system users to seed into the database.
 * @type {Array<{fullName: string, username: string, password: string, role: string}>}
 */
const DEFAULT_USERS = [
  {fullName: 'System Admin', username: 'admin', password: 'admin123', role: 'admin'},
  {fullName: 'Jane Welfare', username: 'jane', password: 'jane123', role: 'staff'},
  {fullName: 'John Supervisor', username: 'john', password: 'john123', role: 'staff'},
  {fullName: 'Mary Manager', username: 'mary', password: 'mary123', role: 'manager'},
];

/**
 * Seeds default users into the database.
 * Skips users that already exist (ON CONFLICT DO NOTHING).
 * @return {Promise<void>}
 */
async function seed() {
  try {
    for (const user of DEFAULT_USERS) {
      const hash = await bcrypt.hash(user.password, SALT_ROUNDS);
      await db.query(
        `INSERT INTO users (full_name, username, password, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (username) DO NOTHING`,
        [user.fullName, user.username, hash, user.role],
      );
      console.log(
        `User created: ${user.username} (${user.role}) — password: ${user.password}`,
      );
    }
    console.log('\nAll users seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
