'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = require('../db');

/** @param {import('express').Response} res @param {Error} err */
const sendError = (res, err) => res.status(500).json({error: err.message});

/** @const {number} Salt rounds for bcrypt password hashing. */
const SALT_ROUNDS = 10;

/**
 * POST /api/auth/login
 * Authenticates a user and returns a signed JWT token.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.login = async (req, res) => {
  try {
    const {username, password} = req.body;

    if (!username || !password) {
      return res.status(400).json({error: 'Username and password are required.'});
    }

    const result = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username],
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({error: 'Invalid username or password.'});
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({error: 'Invalid username or password.'});
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
      },
      process.env.JWT_SECRET,
      {expiresIn: '8h'},
    );

    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * GET /api/auth/users
 * Returns all system users (excluding passwords).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getAll = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, full_name, username, role, created_at FROM users ORDER BY created_at DESC',
    );
    res.json(result.rows);
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * POST /api/auth/users
 * Creates a new system user with a hashed password. Admin only.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.create = async (req, res) => {
  try {
    const {full_name, username, password, role} = req.body;

    if (!full_name || !username || !password) {
      return res.status(400).json({
        error: 'full_name, username, and password are required.',
      });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await db.query(
      `INSERT INTO users (full_name, username, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, username, role`,
      [full_name, username, hash, role || 'staff'],
    );

    res.status(201).json({
      user: result.rows[0],
      message: 'User created successfully.',
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({error: 'Username already exists.'});
    }
    sendError(res, err);
  }
};

/**
 * DELETE /api/auth/users/:id
 * Deletes a system user. Admin only.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.delete = async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({message: 'User deleted successfully.'});
  } catch (err) {
    sendError(res, err);
  }
};
