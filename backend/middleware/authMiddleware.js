'use strict';

const jwt = require('jsonwebtoken');

/**
 * Middleware that verifies the JWT Bearer token in the Authorization header.
 * Attaches the decoded user payload to `req.user` on success.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({error: 'Access denied. No token provided.'});
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({error: 'Invalid or expired token.'});
  }
};

/**
 * Middleware that restricts access to admin-role users only.
 * Must be used after verifyToken.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({error: 'Access denied. Admins only.'});
  }
  next();
};
