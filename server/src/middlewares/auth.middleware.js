import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ForbiddenError, UnauthorizedError } from '../utils/app-error.js';
export const requireAdmin = (req, res, next) => { const authorization = req.headers.authorization; const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null; if (!token) return next(new UnauthorizedError()); try { req.admin = jwt.verify(token, env.jwtAccessSecret); return next(); } catch { return next(new UnauthorizedError('Invalid or expired access token.')); } };
export const requireRole = (...roles) => (req, res, next) => { if (!req.admin || !roles.includes(req.admin.role)) return next(new ForbiddenError()); return next(); };
