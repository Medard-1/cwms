'use strict';

require('dotenv').config();

const {Pool} = require('pg');

/**
 * PostgreSQL connection pool.
 * Configuration is loaded from environment variables.
 * @type {Pool}
 */
const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'cwms',
  port: Number(process.env.DB_PORT) || 5432,
});

module.exports = pool;
